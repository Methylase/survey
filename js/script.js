var surveyTaken;
var question_type;
var theQuestions;
var instructions;
var typeShown;
var chosenStatements = [];
var max_coin = 3;
var min_coin = 1;
var currentCoin = 0;
var userDB;
var surveyDate;
var clickCounter = 0;
var diffFormattedFirst;
var diffFormattedLast;
var BOL = [1, 4, 7];
var BOS = [2, 5, 8]

function experimentStart() {
    var d = new Date();
    var user_ip;
    var user;
    var startDate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ", " + d.getHours() + ":" + d.getMinutes()
    
    $.getJSON('https://api.ipify.org?format=json', function(data) {
        user_ip = data.ip
        userDB = {
            start_date: startDate,
            ip: ""
        }
        checkIP(user_ip)
    });


}
/**Check IP Existence */
function checkIP(ip) {
    $.ajax({
        type: "POST",
        url: "/api/processing_ip.php",
        data: { ip: ip },
        dataType: 'JSON',
        success: function(response) {
        surveyTaken = response.status;
        document.getElementById("checking").style.display = "none";
        document.getElementById("startBtn").style.display = "block";

        if (surveyTaken == false) {
            userDB.ip = ip;
        }
        localStorage.setItem("survey_respondent", JSON.stringify(userDB))
   
        }
    })
} 

function goToAttention1() {
    var consent = document.getElementById("consent").checked;
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    userDB.consent = consent;
    if (surveyTaken == false && consent == true) {
        localStorage.setItem("survey_respondent", JSON.stringify(userDB))
        window.location.href = '../survey/attention1.html';
    } else if (surveyTaken == false && consent == false) {
        alert("Your Consent is needed!")
    } else {
        alert("You have taken this before")
    }
}

function attention1Load() {
    var userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    if (!userDB.ip && userDB.consent != true) {
        window.location.href = '../survey/index.html';
    }
}

function goToSurvey() {
    var attention1Answer = document.getElementById("fname").value
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    userDB.attention1_answer = attention1Answer;
    getQuestion();
    
    
}
/**Get Survey Type */
function getQuestion() {
    $.ajax({
        type: "GET",
        url: "/api/processing_questionType.php",
        dataType:"JSON",
        success: function(response) {
            userDB.surveyType = Number(response.type);
            console.log(response.type);
            localStorage.setItem("survey_respondent", JSON.stringify(userDB))
            userDB = JSON.parse(localStorage.getItem("survey_respondent"))
            window.location.href = '../survey/survey.html';
        }
    });
}

function surveyLoad() {
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    if (!userDB.ip  && userDB.consent != true) {
        window.location.href = '../survey/index.html';
    }
    surveyDate = new Date();
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function survey() {
    surveyLoad();
    question_type = userDB.surveyType
    theQuestions = questionso;
    instructions = instros;

    //document.getElementById("type").innerHTML = instros[question_type - 1].type;
    document.getElementById("type_description").innerHTML = instros[question_type - 1].description
    var statementsTable = document.getElementById('customers');
    Object.keys(theQuestions).forEach(key => {
        if (key == question_type) {
            var theStatementsNonShuffled = theQuestions[key]
            var theStatements = shuffle(theStatementsNonShuffled);
            typeShown = theStatements;
            statementsTable.innerHTML = "";
            if ([3, 6, 9].includes(question_type)) {
                statementsTable.innerHTML = '<tr><th>S/N</th> <th>Statements</th> <th>Rate</th></tr>'
                for (let i = 0; i < theStatements.length; i++) {
                    statementsTable.innerHTML += '<tr><td>' + (i + 1) + '</td> <td>' + theStatements[i].text + '</td> <td> <div id="rateYo' + i + '"></div> </td></tr>';
                    workingStar(i);
                }
            } else {
                statementsTable.innerHTML = '<tr><th>S/N</th> <th>Statements</th> <th>Select</th></tr>'
                for (let i = 0; i < theStatements.length; i++) {
                    statementsTable.innerHTML = '<tr><th>S/N</th> <th>Statements</th> <th>Select</th></tr>'
                for (let i = 0; i < theStatements.length; i++) {
                    statementsTable.innerHTML += '<tr><td>' + (i + 1) + '</td> <td>' + theStatements[i].text + '</td> <td><input type="checkbox" onclick = "checkboxClicked(event,' + i + ')"/></td></tr>'; 
                }
                }
            }

        }
    });
}

function checkboxClicked(e, idx) {
    console.log("checkbox clicked");
    console.log("The idx is: ", idx)
    incrementClick2()
    for (let k = 0; k < typeShown.length; k++) {
        if (k == idx) {
            var similarfound = false;
            var st = typeShown[k];
            if (chosenStatements.length >= 1) {
                for (let j = 0; j < chosenStatements.length; j++) {
                    if (chosenStatements[j].id == st.id) {
                        similarfound = true;
                        chosenStatements.splice(j, 1);
                        console.log('The stuff a; ', chosenStatements);
                        if (currentCoin > 0) {
                            currentCoin--;
                        }
                        break;
                    }
                }
                if (similarfound == false) {
                    if (e.target.checked == true) {
                        if (currentCoin < max_coin) {
                            currentCoin++
                            st.coins = true;
                            chosenStatements.push(st)

                        } else {
                            alert('You can only select 3 answers')
                            e.target.checked = false;
                        }

                        console.log("The current coin is: ", currentCoin)
                        console.log('The stuff c; ', chosenStatements);

                    }
                }

            } else {
                if (e.target.checked == true) {
                    if (currentCoin < max_coin) {
                        currentCoin++
                        st.coins = true;
                        chosenStatements.push(st)

                    } else {
                        alert('Not more than 3 coins available')
                        e.target.checked = false;
                    }

                    console.log("The current coin is: ", currentCoin)
                    console.log('The stuff c; ', chosenStatements);

                }

            }

        }
    }
}

function workingStar(idx) {
    $(function() {
        $("#rateYo" + idx).rateYo({
            rating: 0,
            fullStar: true,
            onSet: function(rating, rateYoInstance) {
                //alert("" + idx + "Rating is set to: " + rating);
                incrementClick2()
                for (let k = 0; k < typeShown.length; k++) {
                    if (k == idx) {
                        var similarfound = false;
                        var st = typeShown[k];
                        if (chosenStatements.length >= 1) {
                            for (let j = 0; j < chosenStatements.length; j++) {
                                if (chosenStatements[j].id == st.id) {
                                    similarfound = true;
                                    chosenStatements[j].coins = rating
                                    if (chosenStatements[j].coins == 0) {
                                        chosenStatements.splice(j, 1);
                                    }
                                    break;
                                }
                            }
                            if (similarfound == false) {
                                if (rating != 0) {
                                    st.coins = rating;
                                    chosenStatements.push(st)
                                }
                            }

                        } else {
                            if (rating != 0) {
                                st.coins = rating;
                                chosenStatements.push(st)
                            }

                        }
                    }
                }
            }
        });
    });

}

function incrementClick(from) {
    if (clickCounter == 0 && from == "increment") {
        clickCounter++;
        var newDate = new Date();
        var diff = newDate - surveyDate;
        diffFormattedFirst = millisToMinutesAndSeconds(diff)
    } else if (clickCounter == 0 && from == "decrement") {
        
    } else {
        clickCounter++;
        var newDate = new Date();
        var diff = newDate - surveyDate;
        diffFormattedLast = millisToMinutesAndSeconds(diff)
    }
}


function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}


function incrementClick2() {
    if (clickCounter == 0) {
        clickCounter++;
        var newDate = new Date();
        var diff = newDate - surveyDate;
        diffFormattedFirst = millisToMinutesAndSeconds(diff)
    } else {
        clickCounter++;
        var newDate = new Date();
        var diff = newDate - surveyDate;
        diffFormattedLast = millisToMinutesAndSeconds(diff)
    }
}




function submitSurvey() {
    if (chosenStatements.length <3) {
        alert("You haven't done the needful")
    } else {
        userDB.timer_first_click = diffFormattedFirst;
        userDB.timer_last_click = diffFormattedLast;
        userDB.attempted_statements = chosenStatements;
        localStorage.setItem("survey_respondent", JSON.stringify(userDB))
        window.location.href = '../survey/attention2.html';
    }
}

function attention2Load() {
    var userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    if (!userDB.ip && userDB.consent != true) {
        window.location.href = '../survey/index.html';
    }
}

function goToBiodata() {
    var attention2Answer = document.querySelector('input[name="group1"]:checked').value
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    userDB.attention2_answer = attention2Answer;
    localStorage.setItem("survey_respondent", JSON.stringify(userDB))
    window.location.href = '../survey/demographic.html';
}

function biodataLoad() {
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    if (!userDB.ip && userDB.consent != true) {
        window.location.href = '../survey/index.html';
    }
}

function submitExperiment() {
    var infoArray = [];
    var gender = document.querySelector('input[name="gender"]:checked').value
    infoArray.push(gender)
    var ageRange = document.querySelector("#ageId").value;
    infoArray.push(ageRange)
    var education = document.querySelector('#eduId').value
    infoArray.push(education)
    if (!infoArray.includes(null)) {
        document.getElementById("submitMsg").innerHTML = "<i>Submitting...<i>"
        var d = new Date();
        var endDate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ", " + d.getHours() + ":" + d.getMinutes()
        userDB = JSON.parse(localStorage.getItem("survey_respondent"))
        userDB.gender = gender;
        userDB.ageRange = ageRange;
        userDB.educationLevel = education;
        userDB.endDate = endDate;
        submitExperimentToDB();
        
    } else {
        alert("Make sure you fill in all information correctly")
    }


}
/**Submit Experiment to DB */
function submitExperimentToDB() {
    $.ajax({
        type: "POST",
        url: "/api/processing_survey.php",
        data: userDB,
        dataType: 'JSON',
        success: function(response) { 
            userDB.MTurkCode = response.code;
            localStorage.setItem("survey_respondent", JSON.stringify(userDB))
            window.location.href = '../survey/end.html';
        }
    });
}

function endLoad() {
    userDB = JSON.parse(localStorage.getItem("survey_respondent"))
    if (!userDB.ip && userDB.consent != true) {
        window.location.href = '../survey/index.html';
    }
    var Mcode = userDB.MTurkCode;
    userDB.ip = "";
    userDB.consent = "";
    localStorage.setItem("survey_respondent", JSON.stringify(userDB))
    document.getElementById('success_code').innerHTML = "(" + Mcode + ")"
}