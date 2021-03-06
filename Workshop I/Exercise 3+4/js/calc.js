// Jesus. Christ. Finally.

/**
 * Handles ordinary key press events.
 *
 * Ordinary means: the key does not order the calculator to do something. Thus,
 * this function only displays the key on the "Formula Display".
 *
 * @param key [in] [String] The key being pressed.
 */
function KeyPressed(key) {
  if (document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML != "Formula") {
    document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML += key;
  } else {
    document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML = key
  }
}

/**
 * Clear the two displays.
 *
 * This function works with the "C(lear)" key.
 */
function DisplayClearAll() {
  document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML = "Formula";
  document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = "Result";
}

/**
 * Do backspace on "Formula Screen".
 */
function DisplayBackspace() {
  var buf = document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML;
  if (buf.length == 1) {
    document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML = "Formula";
  } else if (buf == "Formula") {
    return;
  } else {
    let resultDisplay = document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML;
    if (resultDisplay == "Result") {
      document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML = buf.slice(0, -1);
    } else {
      document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML = "Formula";
      return;
    }
  }
}

/**
 * Change the calculating method of the calculator.
 *
 * This function works with the switch key on the upper-left corner. It changes its
 * background color to red when "eval()" is selected, and changes the subtitle.
 */
function SwitchAlgorithm() {
  var status = document.getElementById('AlgoSwitchBtn').innerHTML;
  if (status == "Shunt-Yard") {
    // Switch to internal `eval()`
    // NOTE: Using `eval()` is a trick, and is *dangerous*. Not recommended.
    //   Change the color to red to imply this.
    document.getElementById('AlgoSwitchBtn').innerHTML = "eval()";
    document.getElementById('AlgoSwitchBtn').style = "background-color: #ff5e3a;";
    document.getElementById('MainTitle').innerHTML = "Using <code>eval()</code> is <em>dangerous</em>";
    document.getElementById('SubTitle').innerHTML = "Click the \"eval()\" button to switch calc method.";
  } else {
    // It is `eval()`, or Something happened. Switch back to Shunt-Yard.
    document.getElementById('AlgoSwitchBtn').innerHTML = "Shunt-Yard";
    document.getElementById('AlgoSwitchBtn').style = "background-color: #59c7f7;"; // Switch back to default color
    document.getElementById('MainTitle').innerHTML = "The <em>Real</em> Calculator";
    document.getElementById('SubTitle').innerHTML = "Click the \"Shunt-Yard\" button to switch calc method.";
  }
}

/**
 * Main evaluation entry point.
 *
 * This function works with the "equal to" ('=') key. Note that this function also
 * checks for the caption of the "Algorithm Switch" and determine which method to
 * use.
 *
 * The function returns nothing; it displas the result directly on the "Result
 * Display".
 */
function Evaluate() {
  var formula = document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML;
  if (formula == "Formula") {
    return;
  }

  var status = document.getElementById('AlgoSwitchBtn').innerHTML;
  var ret = 0;
  if (status == "eval()") {
    ret = EvaluateWithInnerEval(formula);
  } else if (status == "Shunt-Yard") {
    ret = EvaluateWithShuntingYardAlgo(formula);
  } else {
    // Something happened
    console.log("Internal error: We do not have a calculating method called ", status.tostring, ".");
  }

  if (ret != null) {
    document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = ret;
  } else {} // Something happened (already handled).
}

/**
 * Show Reverse Polish Notation on the "Result Display".
 */
function DisplayShowRPN() {
  try {
    document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = Infix2RPN(document.getElementById('FormulaDisplay').getElementsByTagName('span')[0].innerHTML);
  } catch (e) {
    document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = e;
  }
}

/**
 * Evaluate the formula using the integrated `eval()`.
 *
 * NOTE: You should *never* use it since `eval()` can execute JavaScript codes.
 * Mind exploits.
 *
 * @return If successed, this function returns the resulf value; otherwise it returns null.
 */
function EvaluateWithInnerEval(f) {
  try {
    return eval(f)
  } catch (e) {
    document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = e;
  }

  return null;
}

/**
 * Evaluate the formula using Shunting-Yard Algorithm, kindly by Edsger W. Dijkstra.
 *
 * @return If successed, this function returns the result value; otherwise it returns null.
 */
function EvaluateWithShuntingYardAlgo(f) {
  try {
    return RPNEval(Infix2RPN(f));
  } catch (e) {
    document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = e;
  }

  return null;
}

/**
 * Convert Infix Notation to Postfix Notation (aka Reverse Polish Notation)
 *
 * @param  f [in] Formula in Infix Notaion
 * @return An Array containing the RPN if successed, otherwise null.
 */
function Infix2RPN(f) {
  if (f == null) return null; // Be robust.

  // Arrays in JavaScript have stack methods. Das ist gut.
  var operator = [];      // This is used in the shunting yard.
  var operatorSorted = [] // This is used on the railway. (LOL)
  var result = [];
  var optSeq = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
  };

  // Status "bits".
  var isOptJustPushedIntoStack = false;

  for (let i = 0; i < f.length; i += 1) { // Prof. Weifeng Su said not to do `i++` stuff.
    switch (f[i]) {

      // FIXME: Jesus christ.

      case "0": // fall through
      case "1": // fall through
      case "2": // fall through
      case "3": // fall through
      case "4": // fall through
      case "5": // fall through
      case "6": // fall through
      case "7": // fall through
      case "8": // fall through
      case "9": // fall through
      case ".":
        // Numbers (including decimal points) are pushed directly to the result stack.
        // NOTE: Continuous numbers should be in one element.
        // NOTE: They are strings so far.
        // NOTE: Simply connect 2 numeric characters can boom yourself. Consider:
        //         3 + 4
        //   Will become '34','+' if you are naive. (I were.)
        //   Hence, after an operator is pushed into the operator stack, the numbers
        //   backwards are distinct, and should not be conjuncted.
        // NOTE: Consider "99999999.9999"... Should determine the whole number but only
        //   the character in the back.
        // NOTE: XXX: `parseFloat()` can return {,-}Infinity or NaN. Use `isFinite()` to
        //   avoid processing them.
        // BUG: 0.2.5 * 9 = 1.8
        //   This is because:
        //   1. `parseFloat(0.2.5)` will return 0.2;
        //   2. So far we can do nothing with the extra decimal points.
        //   Mark as WONTFIX.
        if (isFinite(parseFloat(result[result.length - 1])) && (!isOptJustPushedIntoStack)) {
            result[result.length - 1] += f[i];
          } else {
            result.push(f[i]);
            isOptJustPushedIntoStack = false;
          }

        break;

      // Operators have precedences:
      //
      // - '*' -> 2
      // - '/' -> 2
      // - '+' -> 1
      // - '−' -> 1
      //
      // Currently there is no '^'(power, which is right-associative) or functions
      // (like 'cos' and 'sin'). We only consider the 4 operators above.

      case "+": // fall through
      case "-": // fall through
      case "*": // fall through
      case "/":
          while (operator[operator.length - 1] == "+"
              || operator[operator.length - 1] == "-"
              || operator[operator.length - 1] == "*"
              || operator[operator.length - 1] == "/") {
            if (optSeq[f[i]] <= optSeq[operator[operator.length - 1]]) {
              // Pop to result stack
              result.push(operator.pop());
            } else {
              break;
            }
          }

          // Push f[i] into operator stack, finally.
          operator.push(f[i]);
          isOptJustPushedIntoStack = true; // Set for numbers operations.

        break;

      case "(":
        // left bracket is pushed directly to the operator stack.
        // NOTE: Consider 2(1+2), this actually means 2*(1+2). Handle it.
        // XXX:  Such handling only applies when there is no functions.
        if (!isOptJustPushedIntoStack) {
          operator.push("*");
          isOptJustPushedIntoStack = true;
        }

        operator.push(f[i]);

        break;

      case ")":
        while (operator[operator.length - 1] != "(") {
          if (operator[operator.length - 1] != null) {
            result.push(operator.pop());
          } else {
            // Ouch! We met EOS (End of Stack, LOL) even before we met '(' (mismatched parentheses).
            throw ("Syntax Error: Mismatched parentheses.");
            return null;
          }
        }

        // '(' met. Throw it.
        operator.pop();

        break;

      default:
        // Something happened.
        throw ("Internal Error: Unwanted character in formula.")
        return null;
    } // switch (f[i])
  } // for (let i = 0; i < f.length; i += 1)

  // Input stack is empty now, but operator stack may not.
  // Now dumping all remaining operators from the stack.
  for (let i = operator.length - 1; i >= 0; i -= 1) { // Prof. Weifeng Su said not to do `i--` stuff.
    if ((operator[i] == "(") || (operator[i] == ")")) {
      // NOTE: There should not be any brackets now. If there is, you're boomed.
      throw ("Syntax Error: Mismatched parentheses.");
      return null;
    } else {
      result.push(operator.pop());
    }
  }

  // Finally, let's give the RPN back. Jesus...
  // NOTE: result is of type Array.
  return result;
}

/**
 * Given RPN, calculate the answer.
 *
 * @param  rpn [in] [Array] The RPN.
 * @return [Int] Result.
 */
function RPNEval(rpn) {
  if (rpn == null) return null; // Be robust.

  var stack = [];

  for (let i = 0; i < rpn.length; i += 1) { // Prof. Weifeng Su said not to do `i++` stuff.
    // NOTE: rpn is of type Array.
    if (isFinite(parseFloat(rpn[i]))) {
      stack.push(rpn[i]);
    } else {
      // NOTE: Pop sequence matters.
      let right = parseFloat(stack.pop());
      let left  = parseFloat(stack.pop());

      if (left && right) {
        switch (rpn[i]) {
          case "+":
            stack.push(left + right);
            break;
          case "-":
            stack.push(left - right);
            break;
          case "*":
            stack.push(left * right);
            break;
          case "/":
            stack.push(left / right);
            break;
          default:
            // Something happened.
            throw ("Parsing error: not recognizable operator ", rpn[i], "!");
            return null;
            break; // Well, though not necessary.
        }
      } else {
        // Something happened!
        throw ("Parsing error: no enough numbers to operate.");
        return null;
      }
    }
  } // for (let i = 0; i < rpn.length; i += 1)

  // NOTE: Finally there should be only one number in the stack.
  if (stack.length == 1) {
    return parseFloat(stack[0]);
  } else {
    // Something happened again.
    throw ("Internal error: more than one number in stack!");
  }

  return null;
}

/**
 * Sum for fun, per requirement.
 */
function SumForFun() {
  var sum = 0;
  // NOTE: Prof. Weifeng Su said not to do `i++` stuff.
  // for (let i = 1; i <= 100; sum += i++) {}
  for (let i = 1; i <= 100; i += 1) {
    sum += i;
  }
  document.getElementById('ResultDisplay').getElementsByTagName('span')[0].innerHTML = sum;
}
