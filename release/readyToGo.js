/* eslint-disable */

var correct = false;

function initialize (interactiveMode) {
  jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/two.js/0.6.0/two.min.js', run);

  function run () {
    /* Replace with minified code */
  }
};

function setFeedback (response, answer) {
  /* called when response or answer is going to
  be rendered.
  response: 	student's response of question.
  answer: 	correct answer of question.*/
};

function getResponse () {
  /* called when grade button is clicked,
  to retrieve back student's response.*/
  /* Your code starts from here:*/

  if (correct === true) {
    return 1;
  } else {
    return 0;
  }
};

/* Additional functions start from here*/
