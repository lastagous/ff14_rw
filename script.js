function loadPage() {
    var jobForm = document.getElementById("job-form");
    var result = "";

    var i;
    for (i = 0; i < jobs.length; i++) {
        var job = jobs[i];

        var checked = $.cookie("check-job-" + job.ID) ? $.cookie("check-job-" + job.ID) : "checked";

        result += "<div class=\"form-check-inline\">";
        result += "<input type=\"checkbox\" value=\"" + job.ID + "\" id=\"check-job-" + job.ID + "\" class=\"check-job\" onclick=\"checkboxClicEvent(" + job.ID + ")\" " + checked + ">";
        result += "<label class=\"form-check-label\" for=\"check-job-" + job.ID + "\">"
        result += "<img style=\"width: 24px;\" src=\"" + xivapi + job.Icon + "\">" + job.Name;
        result += "</label>";
        result += "</div>";
    }
    jobForm.innerHTML += result;
}

function generateCards() {
    var jobCard = document.getElementById("job-cards");
    var result = "";

    var i;
    for (i = 0; i < jobs.length; i++) {
        var job = jobs[i];

        checkbox = document.getElementById("check-job-" + job.ID);
        jobCard.innerHTML += generateCardDom(job);
        result = "";
        generateRwCheckPane(job.ID);
        generateNextRwName(job);
        generateNextQuest(job);
        generateNextQuestItem(job);
        if (!checkbox.checked) {
            document.getElementById("card-" + job.ID).style.display = "none";
        }
    }

}

function generateCardDom(job) {
    var result = "";

    result += "<div id=\"card-" + job.ID + "\" class=\"card bg-dark\">";
    result += "<div class=\"card-body\">";
    result += "<h3 class=\"card-title\"><img class=\"mr-2\" style=\"width: 48px;\" src=\"" + xivapi + job.Icon + "\">" + job.Name + "</h4>";
    result += "<div class=\"next-rw-pane d-flex align-items-center\" style=\"height: 50px;\">"
    result += "<h4 class=\"ml-5\">Next</h4>"
    result += "<div id=\"next-rw-" + job.ID + "\" class=\"ml-3\"></div>";
    result += "</div>";
    result += "<div id=\"next-quest-" + job.ID + "\" class=\"next-quest-pane d-flex\" style=\"height: 50px;\"></div>";
    result += "<div id=\"next-quest-item-" + job.ID + "\" class=\"next-quest-item-pane d-flex justify-content-end\" style=\"height: 30px;\"></div>";
    result += "<div id=\"rw-check-" + job.ID + "\" class=\"d-flex mt-3\"></div>";
    result += "</div>";
    result += "</div>";

    return result;
}

function generateRwCheckPane(jobId) {
    var pane = document.getElementById("rw-check-" + jobId);
    var result = "";

    var job = jobs.find(job => job.ID == jobId);

    var i;
    for (i = 0; i < job.Rws.length; i++) {
        var prev = i == 0 ? null : job.Rws[i - 1].ID;
        var next = i + 1 == job.Rws.length ? null : job.Rws[i + 1].ID;
        var weapon = job.Rws[i];

        var display = $.cookie("rw-img-" + weapon.ID) ? $.cookie("rw-img-" + weapon.ID) : "none";
        var prevDisplay = prev == null ? null : $.cookie("rw-img-" + job.Rws[i - 1]) ? $.cookie("rw-img-" + job.Rws[i - 1]) : "none";

        var arrow_animation_button = (prevDisplay == null || prevDisplay == "block") && display == "none" ? " arrow_animation_button" : "";
        var stamp = display == "none" ? "" : "stamp";

        result += "<div id=\"rw-img-bg-" + weapon.ID + "\" class=\"mr-2" + arrow_animation_button + "\" style=\"background-image:url(" + xivapi + weapon.Icon + "); height:40px; width:40px;\" onclick=\"rwImgClickEvent(" + weapon.ID + "," + prev + "," + next + "," + jobId + ")\">";
        result += "<img id=\"rw-img-" + weapon.ID + "\" class=\"rw-" + job.ID + " " + stamp + "\" style=\"display:" + display + ";\" src=\"resource/other/circle-3.svg\" >";
        result += "</div>";
    }
    pane.innerHTML = result;
}

function generateNextRwName(job) {
    var i;
    for (i = 0; i < job.Rws.length; i++) {
        var rw = job.Rws[i];
        if (document.getElementById("rw-img-" + rw.ID).style.display == "none") {
            document.getElementById("next-rw-" + job.ID).innerHTML = rw.Name;
            return;
        }
    }
    document.getElementById("next-rw-" + job.ID).innerHTML = "完成！";
}

function generateNextQuest(job) {
    var i;
    for (i = 0; i < job.Rws.length; i++) {
        var rw = job.Rws[i];
        if (document.getElementById("rw-img-" + rw.ID).style.display == "none") {
            var result = "";
            var questIndex = rwQuestJunctionList.find(v => v.rw == i).quest;
            var quest = quests[questIndex];
            result += "<img style=\"width: 32px; height:32px\" src=\"" + xivapi + quest.Icon + "\">"
            result += "<div>" + quest.Name.replace(" ", "") + "</div>"
            document.getElementById("next-quest-" + job.ID).innerHTML = result;
            return;
        }
    }
    document.getElementById("next-quest-" + job.ID).innerHTML = "";
}

function generateNextQuestItem(job) {
    var i;
    for (i = 0; i < job.Rws.length; i++) {
        var rw = job.Rws[i];
        if (document.getElementById("rw-img-" + rw.ID).style.display == "none") {
            var result = "";
            var items = rwQuestJunctionList.find(v => v.rw == i).items;

            var j = 0;
            for (j = 0; j < items.length; j++) {
                var item = items[j];

                var questItem = questItems[item.index];
                result += "<img style=\"width: 24px; height:24px;\" src=\"" + xivapi + questItem.Icon + "\">"
                result += "<div class=\"mr-2\">×" + item.used + "</div>"
            }

            document.getElementById("next-quest-item-" + job.ID).innerHTML = result;
            return;
        }
    }
    document.getElementById("next-quest-item-" + job.ID).innerHTML = "";
}


function progressCalculation() {
    var checks = document.getElementsByClassName("check-job");
    var count = 0;
    var totalCount = 0;

    var i;
    for (i = 0; i < checks.length; i++) {
        var check = checks[i];
        if (check.checked) {
            var rws = document.getElementsByClassName("rw-" + check.value);
            var j;
            for (j = 0; j < rws.length; j++) {
                var rw = rws[j];
                totalCount++;
                if (rw.style.display == "block") {
                    count++;
                }
            }
        }
    }

    if (totalCount == 0) {
        progress.innerText = "完成度:" + 0 + "%";
        progress.style.width = 0;
    } else {
        var progress = document.getElementById("progress");
        var per = Math.floor(count / totalCount * 100) + "%";
        progress.innerText = "完成度:" + per;
        progress.style.width = per;
    }
}

function checkboxClicEvent(id) {
    if (document.getElementById("check-job-" + id).checked) {
        document.getElementById("card-" + id).style.display = "block";
        $.cookie("check-job-" + id, "checked");
    } else {
        document.getElementById("card-" + id).style.display = "none";
        $.cookie("check-job-" + id, "");
    }
    progressCalculation();
}

function rwImgClickEvent(id, prevId, nextId, jobId) {
    var img = document.getElementById("rw-img-" + id);
    var job = jobs.find(job => job.ID == jobId);

    if (img.style.display == "block") {
        if (nextId == null || (nextId != null && document.getElementById("rw-img-" + nextId).style.display == "none")) {
            if (nextId != null) {
                document.getElementById("rw-img-bg-" + nextId).classList.toggle("arrow_animation_button");
            }
            document.getElementById("rw-img-bg-" + id).classList.toggle("arrow_animation_button");
            document.getElementById("rw-img-" + id).classList.toggle("stamp");
            img.style.display = "none";
            $.cookie("rw-img-" + id, "none");
            generateNextRwName(job);
            generateNextQuest(job);
            progressCalculation();
            generateNextQuestItem(job);
        }
    } else {
        if (prevId == null || (prevId != null && document.getElementById("rw-img-" + prevId).style.display == "block")) {
            if (nextId != null) {
                document.getElementById("rw-img-bg-" + nextId).classList.toggle("arrow_animation_button");
            }
            document.getElementById("rw-img-bg-" + id).classList.toggle("arrow_animation_button");
            document.getElementById("rw-img-" + id).classList.toggle("stamp");
            img.style.display = "block";
            $.cookie("rw-img-" + id, "block");
            generateNextRwName(job);
            generateNextQuest(job);
            progressCalculation();
            generateNextQuestItem(job);
        }
    }
}

this.loadPage();
this.generateCards();
this.progressCalculation();