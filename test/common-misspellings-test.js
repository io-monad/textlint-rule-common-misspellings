/* textlint-rule-common-misspellings
 * Copyright (C) 2016  IRIDE Monad <iride.monad@gmail.com>
 *
 * This file is part of `textlint-rule-common-misspellings`.
 *
 * `misspellings` is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * `misspellings` is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with `misspellings`.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

import rule from "../src/common-misspellings";

var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
tester.run("common-misspellings", rule, {
  valid: [
    "Hello, world",
    "There is no misspelled word in this sentence",
    {
      text: "Mispelled is ignored",
      options: { ignore: ["mispelled"] }
    }
  ],
  invalid: [
    {
      text: "There is a mispelled word in tihs sentence.",
      output: "There is a misspelled word in this sentence.",
      errors: [
        {
          message: "This is a commonly misspelled word. Correct it to misspelled",
          line: 1,
          column: 12
        },
        {
          message: "This is a commonly misspelled word. Correct it to this",
          line: 1,
          column: 30
        },
      ]
    },
    {
      text: "Nice boaut.",
      output: "Nice boaut.",  // Unfixable!
      errors: [
        {
          message: "This is a commonly misspelled word. Correct it to bout, boat, about",
          line: 1,
          column: 6
        }
      ]
    }
  ]
});
