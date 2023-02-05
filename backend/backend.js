function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './backend/data.json', true); // Replace 'appDataServices' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

let data = []
loadJSON(function (response) {
    // Parsing JSON string into object
    const actual_JSON = JSON.parse(response);
    actual_JSON.data.forEach(element => {
        data.push({
            ...element
        })
    });
});


function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function accordion(title, description) {
    return `<div class="accordion-item">
    <h2 class="accordion-header" id="headingOne">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
          ${title}
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        ${description}
      </div>
    </div>
  </div>`
}

var render = function (template, node) {
    if (!node) return;
    node.innerHTML = (typeof template === 'function' ? template() : template);
};

function buttonCode() {


    // const htmlQuestion = "It's pretty ok"
    const htmlQuestion = document.getElementById('question').value
    const questions = []
    for (const record of data) {
        const question = record.question
        questions.push(...question)
    }
    let selectedQuestion = {
        "question": "",
        "score": 0
    }

    questions.forEach((question) => {
        let score = similarity(question, htmlQuestion)
        if (selectedQuestion === null) {
            selectedQuestion = {
                question,
                score
            }
        }
        if (selectedQuestion !== null && selectedQuestion.score < score) {
            selectedQuestion = {
                question,
                score
            }
        }
    })

    let htmlAnswer = {
        "response": "Uhh, I don't know what she meant",
        "description": "",
        "score": selectedQuestion.score
    }
    data.forEach(record => {
        if (htmlQuestion && record.question.includes(selectedQuestion.question)) {
            htmlAnswer = {...choose(record.answer), "score": selectedQuestion.score}
        }
    })

    const htmlAccordion = accordion(htmlAnswer.response, htmlAnswer.description)
    render(htmlAccordion, document.querySelector('#accordionFMT'));
}