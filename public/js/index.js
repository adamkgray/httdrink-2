// index.js

// actions
graydux.actions.title = "TITLE";
graydux.actions.question = "QUESTION";
graydux.actions.answer = "ANSWER";
graydux.actions.shuffle = "SHUFFLE";
graydux.actions.score = "SCORE";

// initial state
graydux = Object.assign(graydux, {}, {
	isTeamATurn: true,
    score: {
		teamA: 0,
		teamB: 0
	},
    question: { code: 0, value: ""},
    questionIndex: 0,
    answers: [],
    usedStatusCodes: [],
    statusCodes: [
		{ code: 100, value: "Continue" },
		{ code: 101, value: "Switching Protocols" },
		{ code: 200, value: "OK" },
		{ code: 201, value: "Created" },
		{ code: 202, value: "Accepted" },
		{ code: 203, value: "Non-Authoritative Information" },
		{ code: 204, value: "No Content" },
		{ code: 205, value: "Reset Content" },
		{ code: 206, value: "Partial Content" },
		{ code: 300, value: "Multiple Choices" },
		{ code: 301, value: "Moved Permanently" },
		{ code: 302, value: "Found" },
		{ code: 303, value: "See Other" },
		{ code: 304, value: "Not Modified" },
		{ code: 305, value: "Use Proxy" },
		{ code: 307, value: "Temporary Redirect" },
		{ code: 400, value: "Bad Request" },
		{ code: 401, value: "Unauthorized" },
		{ code: 402, value: "Payment Required" },
		{ code: 403, value: "Forbidden" },
		{ code: 404, value: "Not Found" },
		{ code: 405, value: "Method Not Allowed" },
		{ code: 406, value: "Not Acceptable" },
		{ code: 407, value: "Proxy Authentication Required" },
		{ code: 408, value: "Request Timeout" },
		{ code: 409, value: "Conflict" },
		{ code: 410, value: "Gone" },
		{ code: 411, value: "Length Required" },
		{ code: 412, value: "Precondition Failed" },
		{ code: 413, value: "Request Entity Too Large" },
		{ code: 414, value: "Request-URI Too Long" },
		{ code: 415, value: "Unsupported Media Type" },
		{ code: 416, value: "Requested Range Not Satisfiable" },
		{ code: 417, value: "Expectation Failed" },
		{ code: 500, value: "Internal Server Error" },
		{ code: 501, value: "Not Implemented" },
		{ code: 502, value: "Bad Gateway" },
		{ code: 503, value: "Service Unavailable" },
		{ code: 504, value: "Gateway Timeout" },
		{ code: 505, value: "HTTP Version Not Supported" }
    ]
});

// helper functions
const answerUI = (tag, result) => {
    switch (result) {
        case "correct":
            tag.style = "transition: 0.5s; background-color: #4CAF50;";
            return
        case "incorrect":
            tag.style = "transition: 0.5s; background-color: #a53a37;";
            return
        default:
            return
    }
}

const headerUI = (tag, color) => {
    tag.style.color = color;
}

const victoryUI = (team) => {
    let victoryTag = document.getElementById("victory");

    if (team == "teamA") {
        victoryTag.innerHTML = "Team A Victory";
    } else if (team == "teamB") {
        victoryTag.innerHTML = "Team B Victory";
    }

    victoryTag.style.opacity = 1;

    window.setTimeout(() => {
        // we don't need to change the inner HTML because it will get updated. Just hide it.
        victoryTag.style.opacity = 0;
    }, 3000);
}


const shuffleArr = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// reducers
const title = (state, action, data) => {
    switch (action) {
        case "TITLE":
            return Object.assign(state, {}, { title: data });
        default:
            return state;
    }
}

const answer = (state, action, data) => {
    switch (action) {
        case "ANSWER":
            if (state.statusCodes.length < 3) {
                state =  Object.assign(state, {}, {
                    statusCodes: shuffleArr(state.usedStatusCodes.concat(state.statusCodes)),
                    usedStatusCodes: []
                });
            }
            return Object.assign(state, {}, {
                answers: [
                    state.statusCodes[0],
                    state.statusCodes[1],
                    state.statusCodes[2],
                    state.statusCodes[3]
                ],
                usedStatusCodes: state.usedStatusCodes.concat([
                    state.statusCodes[0],
                    state.statusCodes[1],
                    state.statusCodes[2],
                    state.statusCodes[3]
                ]),
                statusCodes: state.statusCodes.slice(4)
            })
        default:
            return state;
    }
}

const question = (state, action, data) => {
    switch (action) {
        case "QUESTION":
            let questionIndex = getRandomInt(0, 3);
            let question = state.answers[questionIndex];
            return Object.assign(state, {}, {
                questionIndex: questionIndex,
                question: question
            });
        default:
            return state;
    }
}

const shuffle = (state, action, data) => {
    switch (action) {
        case "SHUFFLE":
            return Object.assign(state, {}, { statusCodes: shuffleArr(state.statusCodes) });
        default:
            return state;
    }
}

const score = (state, action, data) => {
    switch (action) {
        case "SCORE":
            // When Team A answers correctly
			if (data.isTeamATurn && data.isCorrect) {

                // return to 0 after 3
                let newScore;
                if (state.score.teamA == 2) {
                    victoryUI("teamA");
                    newScore = 0;
                } else {
                    newScore = state.score.teamA + 1;
                }

				return Object.assign(state, {}, {
                    score: {
                        teamA: newScore,
                        teamB: state.score.teamB
                    },
                    isTeamATurn: !state.isTeamATurn
                });
            // When Team B answers correctly
            } else if (data.isCorrect) {

                // return to 0 after 3
                let newScore;
                if (state.score.teamB == 2) {
                    victoryUI("teamB");
                    newScore = 0;
                } else {
                    newScore = state.score.teamB + 1;
                }

				return Object.assign(state, {}, {
                    score: {
                        teamB: newScore,
                        teamA: state.score.teamA
                    },
                    isTeamATurn: !state.isTeamATurn
                });
            // For all incorrect answers
            } else {
                return Object.assign(state, {}, {
                    isTeamATurn: !state.isTeamATurn
                });
            }
        default:
            return state;
    }
}

// subscriptions
const mapStateToTitle = (state) => {
    document.getElementById("title").innerHTML = state.title;
}

const mapStateToScore = (state) => {
	document.getElementById("team-a-score").innerHTML = state.score.teamA;
	document.getElementById("team-b-score").innerHTML = state.score.teamB;
}

const mapStateToQuestion = (state) => {
    document.getElementById("question").innerHTML = state.question.code;
}

const mapStateToAnswer = (state) => {
    // update content
    let answers = "";
    for (let i in state.answers) {
        let value = state.answers[i].value;
        answers += "<li><button class='answer-field'>" + value + "</button></li>";
    }
    document.getElementById("answers").innerHTML = answers;

    // register listeners
    const nextRound = (event) => {
        console.log(event);

        let answerTag;
        if (event.path) {
            // chrome
            answerTag = event.path[0];
        } else {
            // safari
            aswerTag = event.srcElement;
        }

		let isCorrect = false;

		// update UI
        if (state.question.value == answerTag.innerText) {
            answerUI(answerTag, "correct");
			isCorrect = true;
        } else {
            answerUI(answerTag, "incorrect");
        }

        // this order is important, since the question is pulled from the answers
        window.setTimeout(() => {
            graydux.dispatch(graydux.actions.answer, {});
            graydux.dispatch(graydux.actions.question, {});
			graydux.dispatch(graydux.actions.score, {
				"isTeamATurn": state.isTeamATurn,
				"isCorrect": isCorrect
			});
        }, 1500);
    }

	// set listeners
    answers = document.getElementsByClassName("answer-field");
    for (let i in answers) {
        answers[i].onclick = nextRound;
    }
}

const mapStateToTeamHeaders = (state) => {
    if (state.isTeamATurn) {
        headerUI(document.getElementById("team-a-header"), "yellow");
        headerUI(document.getElementById("team-b-header"), "black");
    } else {
        headerUI(document.getElementById("team-b-header"), "yellow");
        headerUI(document.getElementById("team-a-header"), "black");
    }
}

// add subscriptions
graydux.subscribers.push(mapStateToTitle);
graydux.subscribers.push(mapStateToQuestion);
graydux.subscribers.push(mapStateToAnswer);
graydux.subscribers.push(mapStateToScore);
graydux.subscribers.push(mapStateToTeamHeaders);

// add reducers
graydux.reducers.push(title);
graydux.reducers.push(shuffle);
graydux.reducers.push(answer);
graydux.reducers.push(question);
graydux.reducers.push(score);

// initial render
graydux.dispatch(graydux.actions.title, "HTTDrink");
graydux.dispatch(graydux.actions.shuffle, {});
graydux.dispatch(graydux.actions.answer, {});
graydux.dispatch(graydux.actions.question, {});
