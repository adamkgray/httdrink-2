// index.js

const graydux = new Graydux();

const TITLE = "title";
const ANSWERS = "answers";
const QUESTION = "question";
const STATUS_CODES = "statusCodes";
const SCORE = "score";
const TEAM_A = "teamA";
const TEAM_B = "teamB";
const IS_TEAM_A_TURN = "isTeamATurn";
const SHUFFLE = "shuffle";

// initialize state
graydux.setState([], {
    title: "",
	isTeamATurn: true,
    score: {
		teamA: 0,
		teamB: 0
	},
    question: {
        code: 0,
        value: "",
        index: 0
    },
    answers: [],
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

// HELPER FUNCTIONS

const victoryUI = (team) => {
    let victoryTag = document.getElementById("victory");

    if (team == TEAM_A) {
        victoryTag.innerHTML = "Team A Victory";
    } else if (team == TEAM_B) {
        victoryTag.innerHTML = "Team B Victory";
    }

    victoryTag.style.opacity = 1;

    window.setTimeout(() => {
        // we don't need to change the inner HTML because it will get updated. Just hide it.
        victoryTag.style.opacity = 0;
    }, 10000); // 10 seconds
}


const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// REDUCERS

graydux.addReducer(TITLE, [TITLE], (state, action, value) => {
    switch (action) {
        case TITLE:
            return value;
        default:
            return state;
    }
});

graydux.addReducer(ANSWERS, [ANSWERS], (state, action, value) => {
    switch (action) {
        case ANSWERS:
            return graydux.getState([STATUS_CODES]).slice(0, 4);
        default:
            return state;
    }
});

graydux.addReducer(QUESTION, [QUESTION], (state, action, value) => {
    switch (action) {
        case QUESTION:
            const question = graydux.getState([ANSWERS])[getRandomInt(0, 3)];
            return {
                code: question.code,
                value: question.value,
            }
        default:
            return state;
    }
});

graydux.addReducer(SHUFFLE, [STATUS_CODES], (state, action, value) => {
    switch (action) {
        case SHUFFLE:
            return shuffle(state);
        default:
            return state;
    }
});

graydux.addReducer(TEAM_A, [SCORE, TEAM_A], (state, action, value) => {
    switch (action) {
        case TEAM_A:
            return (state == 2) ? 0 : state + 1;
        default:
            return state;
    }
});

graydux.addReducer(TEAM_B, [SCORE, TEAM_B], (state, action, value) => {
    switch (action) {
        case TEAM_B:
            return (state == 2) ? 0 : state + 1;
        default:
            return state;
    }
});

graydux.addReducer(IS_TEAM_A_TURN, [IS_TEAM_A_TURN], (state, action, value) => {
    switch (action) {
        case IS_TEAM_A_TURN:
            return !state;
        default:
            return state;
    }
});

// NEXT ROUND LOGIC

const nextRound = (event) => {
    // Handle browser APIs
    let answerTag;
    if (event.path) {
        answerTag = event.path[0]; // chrome
    } else {
        answerTag = event.srcElement; // safari
    }

    const realAnswer = graydux.getState([QUESTION, "value"]);
    const userAnswer = answerTag.innerText;
    const isTeamATurn = graydux.getState([IS_TEAM_A_TURN]);

    if (realAnswer == userAnswer) {
        // Show that it was the correct answer
        answerTag.style.backgroundColor = "#4CAF50;"

        if (isTeamATurn && graydux.getState([SCORE, TEAM_A]) == 2) {
                victoryUI(TEAM_A);
        } else if (graydux.getState([SCORE, TEAM_B]) == 2) {
                victoryUI(TEAM_B);
        }
    } else {
        // Show that it was the incorrect answer
        answerTag.style.backgroundColor = "#a53a37;";
    }

    // this order is important, since the question is pulled from the answers
    window.setTimeout(() => {
        if (realAnswer == userAnswer) {
            if (isTeamATurn) {
                graydux.dispatch(TEAM_A, {});
            } else {
                graydux.dispatch(TEAM_B, {});
            }
        }
        graydux.dispatch(IS_TEAM_A_TURN, {});
        graydux.dispatch(SHUFFLE, {});
        graydux.dispatch(ANSWERS, {});
        graydux.dispatch(QUESTION, {});
    }, 1500);
}

// SUBSCRIPTIONS

graydux.subscribe(TITLE, (state) => {
    document.getElementById(TITLE).innerHTML = state;
});

graydux.subscribe(TEAM_A, (state) => {
	document.getElementById("team-a-score").innerHTML = state;
});

graydux.subscribe(TEAM_B, (state) => {
	document.getElementById("team-b-score").innerHTML = state;
});

graydux.subscribe(QUESTION, (state) => {
    document.getElementById(QUESTION).innerHTML = state.code;
});

graydux.subscribe(ANSWERS, (state) => {
    // update content
    let answers = "";
    for (let i in state) {
        let value = state[i].value;
        answers += "<li><button class='answer-field'>" + value + "</button></li>";
    }
    document.getElementById(ANSWERS).innerHTML = answers;

	// set onclick attribute for each answer
    answers = document.getElementsByClassName("answer-field");
    for (let i in answers) {
        answers[i].onclick = nextRound;
    }
});

graydux.subscribe(IS_TEAM_A_TURN, (state) => {
    if (state) {
        document.getElementById("team-a-header").style.color = "yellow";
        document.getElementById("team-b-header").style.color = "black";
    } else {
        document.getElementById("team-a-header").style.color = "black";
        document.getElementById("team-b-header").style.color = "yellow";
    }
});

// initial render
graydux.dispatch(TITLE, "HTTDrink");
graydux.dispatch(SHUFFLE, {});
graydux.dispatch(ANSWERS, {});
graydux.dispatch(QUESTION, {});
