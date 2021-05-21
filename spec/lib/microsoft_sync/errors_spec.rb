# frozen_string_literal: true

#
# Copyright (C) 2021 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

require_relative '../../spec_helper'
require 'httparty'

describe MicrosoftSync::Errors do
  describe '.user_facing_message' do
    context 'with a PublicError' do
      class MicrosoftSync::Errors::TestError < MicrosoftSync::Errors::PublicError
        def public_message
          'the public message'
        end
      end

      class MicrosoftSync::Errors::TestError2 < MicrosoftSync::Errors::PublicError; end

      it 'shows the error class name and the public_message' do
        error = MicrosoftSync::Errors::TestError.new("abc")
        expect(described_class.user_facing_message(error)).to \
          eq("Microsoft Sync Errors Test Error: the public message")
      end

      context 'when there is no public_message but there is a message' do
        it 'shows the error class name and the message' do
          error = MicrosoftSync::Errors::TestError2.new('some message')
          expect(described_class.user_facing_message(error)).to \
            eq("Microsoft Sync Errors Test Error2: some message")
        end
      end

      context 'when there is no public message or message' do
        it 'shows just the error class name' do
          error = MicrosoftSync::Errors::TestError2.new
          expect(described_class.user_facing_message(error)).to \
            eq("Microsoft Sync Errors Test Error2")
        end
      end

      context 'when the public message is just the error class name' do
        it 'shows just the error class name' do
          error = MicrosoftSync::Errors::TestError2.new('MicrosoftSync::Errors::TestError2')
          expect(described_class.user_facing_message(error)).to \
            eq("Microsoft Sync Errors Test Error2")
        end
      end
    end

    context 'with a non-PublicError error' do
      it 'shows only the error class name' do
        expect(described_class.user_facing_message(StandardError.new('foo'))).to \
          eq("Standard Error")
      end
    end
  end

  describe described_class::HTTPInvalidStatus do
    subject do
      described_class.for(
        service: 'my api',
        response: double(code: code, body: body, headers: HTTParty::Response::Headers.new(headers)),
        tenant: 'mytenant'
      )
    end

    let(:code) { 422 }
    let(:body) { 'abc' }
    let(:headers) { {} }

    it 'gives a public message with the service name, status code, and tenant' do
      expect(subject.public_message).to eq('My api service returned 422 for tenant mytenant')
    end

    it 'gives an internal message with the public message plus full response body' do
      expect(subject.message).to eq('My api service returned 422 for tenant mytenant, full body: "abc"')
    end

    context 'when the body is very long' do
      let(:body) { 'abc' * 1000 }

      it 'is truncated' do
        expect(subject.message.length).to be_between(1000, 1300)
        expect(subject.message).to include('abc' * 250)
      end
    end

    context 'when body is nil' do
      let(:body) { nil }

      it 'gives a message showing a nil body' do
        expect(subject.message).to \
          eq('My api service returned 422 for tenant mytenant, full body: nil')
      end
    end

    describe '.for' do
      {
        400 => MicrosoftSync::Errors::HTTPBadRequest,
        404 => MicrosoftSync::Errors::HTTPNotFound,
        409 => MicrosoftSync::Errors::HTTPConflict,
        500 => MicrosoftSync::Errors::HTTPInternalServerError,
        502 => MicrosoftSync::Errors::HTTPBadGateway,
        503 => MicrosoftSync::Errors::HTTPServiceUnavailable,
        504 => MicrosoftSync::Errors::HTTPGatewayTimeout,
      }.each do |status_code, error_class|
        context "when the response status code is #{status_code}" do
          let(:code) { status_code }

          it "returns a #{error_class}" do
            expect(subject).to be_a(error_class)
          end
        end
      end

      context 'when the response status code is 429' do
        let(:code) { 429 }

        it { expect(subject.retry_after_seconds).to eq(nil) }

        context 'when the retry-after header is set' do
          let(:headers) { {'Retry-After' => '12.345'} }

          it 'sets retry_after_seconds' do
            expect(subject.retry_after_seconds).to eq(12.345)
          end
        end
      end
    end
  end
end
