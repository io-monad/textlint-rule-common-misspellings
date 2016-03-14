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

import {RuleHelper} from "textlint-rule-helper";
import misspellings from "misspellings";

const DEFAULT_OPTIONS = {
  // Misspellings to be ignored
  "ignore": []
};

function reporter(context, options = {}) {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);

  const ignoreDict = {};
  (opts["ignore"] || []).forEach((s) => {
    ignoreDict[s.toLowerCase()] = true;
  });

  let helper = new RuleHelper(context);
  let {Syntax, RuleError, fixer, report, getSource} = context;
  return {
    [Syntax.Str](node) {
      if (helper.isChildNode(node, [Syntax.BlockQuote])) {
        return;
      }

      return new Promise((resolve, reject) => {
        const text = getSource(node);
        const dict = misspellings.dict({ lowerCase: true });
        const re = misspellings.regexp("ig");

        let matches;
        while (matches = re.exec(text)) {
          const index = matches.index;
          const misspell = matches[0];
          const dickey = misspell.toLowerCase();
          const range = [index, index + misspell.length];

          // Skip ignored word
          if (ignoreDict[dickey]) continue;

          const csv = dict[dickey];
          if (!csv) continue;

          const corrects = csv.split(",");
          let fix;
          if (corrects.length === 1) {
            // If there is only one correct word, we can fix this confidently.
            fix = fixer.replaceTextRange(range, mapCases(misspell, corrects[0]));
          }

          const message = `This is a commonly misspelled word. Correct it to ${corrects.join(", ")}`;
          report(node, new RuleError(message, { index, fix }));
        }

        resolve();
      });
    }
  };
}

function mapCases(source, dest) {
  const mapped = new Array(dest.length);
  for (let i = 0, l = dest.length; i < l; i++) {
    const sc = source.charCodeAt(i);  // becomes NaN when i exceeds source.length
    const dc = dest.charCodeAt(i);

    // If source is upper-case and dest is lower-case
    if (sc >= 0x41 && sc <= 0x5A && dc >= 0x61 && dc <= 0x7A) {
      // Make dest character upper-case
      mapped[i] = dc - 0x20;
    } else {
      mapped[i] = dc;
    }
  }
  return String.fromCharCode.apply(String, mapped);
}

export default {
  linter: reporter,
  fixer: reporter,
}
