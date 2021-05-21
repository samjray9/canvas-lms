#!/usr/bin/env groovy

/*
 * Copyright (C) 2019 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

library "canvas-builds-library@${env.CANVAS_BUILDS_REFSPEC}"
loadLocalLibrary('local-lib', 'build/new-jenkins/library')

final COFFEE_NODE_COUNT = 4
final DEFAULT_NODE_COUNT = 1
final JSG_NODE_COUNT = 3

def makeKarmaStage(group, ciNode, ciTotal) {
  return {
    withEnv([
      "CI_NODE_INDEX=${ciNode}",
      "CI_NODE_TOTAL=${ciTotal}",
      "CONTAINER_NAME=tests-karma-${group}-${ciNode}",
      "JSPEC_GROUP=${group}"
    ]) {
      executeTestStage('build/new-jenkins/js/tests-karma.sh')
    }
  }
}

def executeTestStage(scriptName) {
  withEnv([
    "TEST_RESULT_OUTPUT_DIR=${env.BASE_TEST_RESULT_OUTPUT_DIR}/${env.CONTAINER_NAME}"
  ]) {
    try {
      sh scriptName
    } finally {
      jsStage.tearDownNode()
    }
  }
}

def getLoadAllLocales() {
  return configuration.isChangeMerged() ? 1 : 0
}

pipeline {
  agent none
  options {
    ansiColor('xterm')
    timeout(time: 20)
    timestamps()
  }

  environment {
    BUILD_REGISTRY_FQDN = configuration.buildRegistryFQDN()
    COMPOSE_DOCKER_CLI_BUILD = 1
    COMPOSE_FILE = 'docker-compose.new-jenkins-js.yml'
    DOCKER_BUILDKIT = 1
    FORCE_FAILURE = configuration.forceFailureJS()
    PROGRESS_NO_TRUNC = 1
    RAILS_LOAD_ALL_LOCALES = getLoadAllLocales()
    BASE_TEST_RESULT_OUTPUT_DIR = 'js-results'
  }

  stages {
    stage('Environment') {
      steps {
        script {
          def stageHooks = [
            onNodeAcquired: jsStage.&setupNode,
          ]

          extendedStage('Runner').hooks(stageHooks).nodeRequirements(label: 'canvas-docker', podTemplate: libraryResource('/pod_templates/docker_base.yml'), container: 'docker').obeysAllowStages(false).timeout(10).execute {
            def tests = [:]

            if (env.TEST_SUITE == 'jest') {
              tests['Jest'] = {
                withEnv(['CONTAINER_NAME=tests-jest']) {
                  executeTestStage('build/new-jenkins/js/tests-jest.sh')
                }
              }
            } else if (env.TEST_SUITE == 'coffee') {
              for (int i = 0; i < COFFEE_NODE_COUNT; i++) {
                tests["Karma - Spec Group - coffee${i}"] = makeKarmaStage('coffee', i, COFFEE_NODE_COUNT)
              }
            } else if (env.TEST_SUITE == 'karma') {
              tests['Packages'] = {
                withEnv(['CONTAINER_NAME=tests-packages']) {
                  executeTestStage('build/new-jenkins/js/tests-packages.sh')
                }
              }

              for (int i = 0; i < JSG_NODE_COUNT; i++) {
                tests["Karma - Spec Group - jsg${i}"] = makeKarmaStage('jsg', i, JSG_NODE_COUNT)
              }

              ['jsa', 'jsh'].each { group ->
                tests["Karma - Spec Group - ${group}"] = makeKarmaStage(group, 0, DEFAULT_NODE_COUNT)
              }
            }

            parallel(tests)
          }
        }
      }
    }
  }
}
