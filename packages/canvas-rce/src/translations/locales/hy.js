/*
 * Copyright (C) 2021 - present Instructure, Inc.
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

import formatMessage from '../../format-message'
import '../tinymce/hy'

const locale = {
  "add_8523c19b": { "message": "Ավելացնել" },
  "all_4321c3a1": { "message": "Բոլորը" },
  "announcement_list_da155734": { "message": "Հայտարարությունների ցուցակ" },
  "announcements_a4b8ed4a": { "message": "Հայտարարություններ" },
  "apps_54d24a47": { "message": "Հավելվածներ" },
  "aspect_ratio_will_be_preserved_cb5fdfb8": {
    "message": "Կողմերի հարաբերակցությունը պահպանվելու է"
  },
  "assignments_1e02582c": { "message": "Հանձնարարություններ" },
  "cancel_caeb1e68": { "message": "Չեղյալ համարել" },
  "canvas_plugins_705a5016": { "message": "Canvas  միացվող մոդուլներ" },
  "click_any_page_to_insert_a_link_to_that_page_ac920c02": {
    "message": "Սեղմեք ցանկացած էջ՝ այդ էջին հղում տեղադրելու համար:"
  },
  "click_to_embed_imagename_c41ea8df": {
    "message": "Click to embed { imageName }"
  },
  "click_to_insert_a_link_into_the_editor_c19613aa": {
    "message": "Click to insert a link into the editor."
  },
  "close_d634289d": { "message": "Փակել" },
  "collaborations_5c56c15f": { "message": "Համատեղ աշխատանքներ" },
  "content_type_2cf90d95": { "message": "Բովանդակության տեսակ" },
  "count_plural_one_item_loaded_other_items_loaded_857023b7": {
    "message": "{ count, plural,\n    one {}\n  other {}\n}"
  },
  "course_files_62deb8f8": { "message": "Դասընթացի ֆայլեր" },
  "course_files_a31f97fc": { "message": "Դասընթացի ֆայլեր" },
  "course_navigation_dd035109": { "message": "Նավարկում դասընթացում" },
  "decrease_indent_de6343ab": { "message": "Նվազեցնել ներսի տողագլուխը" },
  "details_98a31b68": { "message": "Մանրամասներ" },
  "dimensions_45ddb7b7": { "message": "Չափերը" },
  "discussions_a5f96392": { "message": "Քննարկումներ" },
  "discussions_index_6c36ced": { "message": "Քննարկումների ցուցիչ" },
  "done_54e3d4b6": { "message": "Պատրաստ է" },
  "due_multiple_dates_cc0ee3f5": { "message": "Վերջնաժամկետ՝ մի քանի ամսաթիվ" },
  "embed_image_1080badc": { "message": "Տեղադրել պատկերը" },
  "files_c300e900": { "message": "Ֆայլեր" },
  "files_index_af7c662b": { "message": "Ֆայլերի ցուցիչ" },
  "generating_preview_45b53be0": { "message": "Կարծիքը գեներացվում է ..." },
  "grades_a61eba0a": { "message": "Գնահատականներ" },
  "group_files_82e5dcdb": { "message": "Խմբի ֆայլեր" },
  "group_navigation_99f191a": { "message": "Խմբի նավարկում" },
  "image_8ad06": { "message": "Պատկեր" },
  "images_7ce26570": { "message": "Պատկերներ" },
  "increase_indent_6d550a4a": { "message": "Ավելացնել ներսի տողագլուխը" },
  "insert_593145ef": { "message": "Տեղադրել" },
  "insert_equella_links_49a8dacd": { "message": "Insert Equella Links" },
  "insert_link_6dc23cae": { "message": "Տեղադրել հղումը" },
  "insert_math_equation_57c6e767": {
    "message": "Զետեղել մաթեմատիկական հավասարում"
  },
  "invalid_file_type_881cc9b2": { "message": "Ֆայլի անընդունելի տեսակ" },
  "keyboard_shortcuts_ed1844bd": { "message": "Արագ հասանելիության ստեղներ" },
  "link_7262adec": { "message": "Հղում" },
  "link_to_other_content_in_the_course_879163b5": {
    "message": "Կապակցել դասընթացի այլ բովանդակության հետ:"
  },
  "link_to_other_content_in_the_group_3fe25379": {
    "message": "Հղում խմբի մյուս բովանդակությանը:"
  },
  "links_14b70841": { "message": "Հղումներ" },
  "load_more_results_460f49a9": { "message": "Load more results" },
  "loading_25990131": { "message": "Բեռնում է..." },
  "loading_bde52856": { "message": "Բեռնում է" },
  "loading_failed_b3524381": { "message": "Loading failed..." },
  "locked_762f138b": { "message": "Արգելափակված է" },
  "media_af190855": { "message": "Մուլտիմեդիա" },
  "modules_c4325335": { "message": "Մոդուլներ" },
  "my_files_2f621040": { "message": "Իմ ֆայլերը" },
  "no_e16d9132": { "message": "Ոչ" },
  "no_results_940393cf": { "message": "No results." },
  "options_3ab0ea65": { "message": "Պարամետրեր" },
  "pages_e5414c2c": { "message": "Էջեր" },
  "people_b4ebb13c": { "message": "Մարդիկ" },
  "preview_53003fd2": { "message": "Նախնական դիտում" },
  "published_c944a23d": { "message": "հրապարակված" },
  "quizzes_7e598f57": { "message": "Թեստեր" },
  "record_7c9448b": { "message": "Գրառում" },
  "recording_98da6bda": { "message": "Ձայնագրում" },
  "rich_content_editor_2708ef21": { "message": "Ֆորմատավորված տեքստի խմբագիր" },
  "save_11a80ec3": { "message": "Պահպանել" },
  "search_280d00bd": { "message": "Որոնել" },
  "size_b30e1077": { "message": "Չափ" },
  "start_over_f7552aa9": { "message": "Սկսել նորից" },
  "submit_a3cc6859": { "message": "Ուղարկել" },
  "syllabus_f191f65b": { "message": "Դասընթացի ծրագիր" },
  "title_ee03d132": { "message": "Վերնագիր" },
  "unpublished_dfd8801": { "message": "չհրապարակված" },
  "upload_file_fd2361b8": { "message": "Բեռնել ֆայլը " },
  "url_22a5f3b8": { "message": "URL" },
  "video_player_b371005": { "message": "Տեսաձայնագրության նվագարկիչ" },
  "wiki_home_9cd54d0": { "message": "Վիկիի տնային էջ" },
  "yes_dde87d5": { "message": "Այո" }
}


formatMessage.addLocale({hy: locale})
