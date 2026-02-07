// Make data row for datatable *
function MakeOneRow(InputData) {
    let rowTemp = []; // init


    // Col_1 -- Date
    let col1 = '<td class="col_1" >';
    col1 += '<label class="col-12"><b>' + GetDateString(InputData.DateStart, "Date") + '</b></label>';
    col1 += '<label class="col-12">' + GetDateString(InputData.DateStart, "Time") + '</label>';
    col1 += '<label class="d-none" data-id="' + InputData.ID + '"></label>';
    col1 += '</td>';
    rowTemp.push(col1);

    // Col_2 -- CTF
    let col2 = '<td class="col_2">' + (InputData.CTF == null ? "" : InputData.CTF) + '</td>';
    rowTemp.push(col2);

    // Col_3 -- Model
    let col3 = '<td class="col_6">' + (InputData.Model == null ? "" : InputData.Model) + '</td>';
    rowTemp.push(col3);

    // Col_4 -- Type
    let col4 = '<td class="col_2">' + (InputData.Type == null ? "" : InputData.Type) + '</td>';
    rowTemp.push(col4);


    // Col 5 -- Works
    let col5 = '<td class="col_3">';
    try {
        let workdescrip = JSON.parse(InputData.WorkDes);
        if (workdescrip[1] != null) {
            col5 += '<p class="text-over">';
            col5 += workdescrip[1];
            col5 += '</p>';
        }
        if (workdescrip[2] != null) {
            col5 += '<p class="text-over">';
            col5 += workdescrip[2];
            col5 += '</p>';
        }
    }
    catch {
        let rowsWork = InputData.WorkDes.split('\n');
        rowsWork.forEach(function (work, index) {
            if (index < 3) {
                col5 += '<p class="text-over">';
                col5 += work;
                col5 += '</p>';
            }
            if (index == 3) {
                col5 += '<p class="text-over">...</p>';
            }
        });
    }
    col5 += '</td>';
    rowTemp.push(col5);


    // Col 6 -- Owner Receive
    let nameRec = JSON.parse(InputData.OwnerReceive);
    let col6 = '<td class="col_5">';
    $.each(nameRec, function (k, v) {
        //0,1,2
        if (k == 2) {
            col6 += `<a href="#" onclick="InfoUserClick(this, event)" data-cardid="${v.CardID}" class="col-12" title="${v.Department} | ${v.CardID} - ${v.VnName} - ${v.CnName}">${v.VnName} ${nameRec.length > 3 ? "..." : ""}</a><br>`;
            return false;
        }
        else {
            col6 += `<a href="#" onclick="InfoUserClick(this, event)" data-cardid="${v.CardID}" class="col-12" title="${v.Department} | ${v.CardID} - ${v.VnName} - ${v.CnName}">${v.VnName}</a><br>`;
        }
    });
    col6 += '</td>';
    rowTemp.push(col6);


    // Col_7 -- Dua Date
    let col7 = '<td class="col_1">';
    col7 += '<label class="col-12"><b>' + (InputData.DueDate == null ? "" : GetDateString(InputData.DueDate, "Date")) + '</b></label>';
    col7 += '<label class="col-12">' + (InputData.DueDate == null ? "" : GetDateString(InputData.DueDate, "Time")) + '</label>';
    col7 += '</td>';
    rowTemp.push(col7);

    // Col 8 Status
    let col8 = "";
    switch (InputData.Status) {
        case "On-going": {
            col8 += '<td class="col_6"><span class="badge rounded-pill bg-warning">On-going</span></td>';
            break;
        }
        case "Open": {
            col8 += '<td class="col_6"><span class="badge rounded-pill bg-danger">Open</span></td>';
            break;
        }
        case "Done": {
            col8 += '<td class="col_6"><span class="badge rounded-pill bg-success">Done</span></td>';
            break;
        }
        case "Close": {
            col8 += '<td class="col_6"><span class="badge rounded-pill bg-secondary">Close</span></td>';
            break;
        }
        default: {
            col8 += '<td class="col_6"><span class="badge rounded-pill bg-secondary"></span></td>';
        }
    }
    rowTemp.push(col8);

    // Col 9
    let col9 = '<td class="col_7">';

    col9 += '<button type="button" class="btn btn-warning" data-toggle="tooltip" title="Edit" data-edit="' + InputData.ID + '">';
    col9 += '<i class="bi bi-pencil-square"></i>';
    col9 += '</button>';

    col9 += '<button type="button" class="btn btn-info" data-toggle="tooltip" title="Detail" data-detail="' + InputData.ID + '">';
    col9 += '<i class="bi bi-eye"></i>';
    col9 += '</button>';

    col9 += '<button type="button" class="btn btn-danger" data-toggle="tooltip" title="Delete" data-delete="' + InputData.ID + '">';
    col9 += ' <i class="bi bi-trash"></i>';
    col9 += '</button>';
    col9 += '</td>';
    rowTemp.push(col9);

    return rowTemp;
}
function MakeOneRowOld(InputData) {
    let rowTemp = []; // init

    // Col 0
    let col0 = '<td class="col_2">' + InputData.ID + '</td>';
    rowTemp.push(col0);

    // Col 1
    let col1 = '<td class="col_1">';
    col1 += '<label class="col-12"><b>' + GetDateString(InputData.DateStart, "Date") + '</b></label>';
    col1 += '<label class="col-12">' + GetDateString(InputData.DateStart, "Time") + '</label>';
    col1 += '</td>';
    rowTemp.push(col1);

    // Col 2
    let col2 = '<td class="col_2">' + InputData.Type + '</td>';
    rowTemp.push(col2);


    // Col 3
    let col3 = '<td class="col_3">';
    let workdescrip = JSON.parse(InputData.WorkDes);
    if (workdescrip[1] != null) {
        col3 += '<p class="text-over">';
        col3 += workdescrip[1];
        col3 += '</p>';
    }
    if (workdescrip[2] != null) {
        col3 += '<p class="text-over">';
        col3 += workdescrip[2];
        col3 += '</p>';
    }
    col3 += '</td>';
    rowTemp.push(col3);

    // Col 4
    let nameReq = JSON.parse(InputData.OwnerRequest);

    let col4 = '<td class="col_4">';
    col4 += '<label class="col-12">' + nameReq[0].Department + ' | ' + nameReq[0].CnName + ' </label>';
    col4 += '<a href="/Dashboard/' + nameReq[0].CardID + '" class="col-12">' + nameReq[0].VnName + '</a>';
    col4 += '</td>';
    rowTemp.push(col4);

    // Col 5
    let nameRec = JSON.parse(InputData.OwnerReceive);

    let col5 = '<td class="col_5">';
    col5 += '<label class="col-12">' + nameRec[0].Department + ' | ' + nameRec[0].CnName + ' </label>';
    col5 += '<a href="/Dashboard/' + nameRec[0].CardID + '" class="col-12">' + nameRec[0].VnName + '</a>';
    col5 += '</td>';
    rowTemp.push(col5);

    // Col 6
    let col6 = "";
    switch (InputData.Status) {
        case "On-going": {
            col6 += '<td class="col_6"><span class="badge rounded-pill bg-warning text-dark">On-going</span></td>';
            break;
        }
        case "Open": {
            col6 += '<td class="col_6"><span class="badge rounded-pill bg-danger">Open</span></td>';
            break;
        }
        case "Done": {
            col6 += '<td class="col_6"><span class="badge rounded-pill bg-success">Done</span></td>';
            break;
        }
        case "Close": {
            col6 += '<td class="col_6"><span class="badge rounded-pill bg-secondary">Close</span></td>';
            break;
        }
        default: {
            col6 += '<td class="col_6"><span class="badge rounded-pill bg-secondary"></span></td>';
        }
    }
    rowTemp.push(col6);

    // Col 7
    let col7 = '<td class="col_7">';

    col7 += '<button type="button" class="btn btn-warning" data-toggle="tooltip" title="Edit" data-edit="' + InputData.ID + '">';
    col7 += '<i class="bi bi-pencil-square"></i>';
    col7 += '</button>';

    col7 += '<button type="button" class="btn btn-info" data-toggle="tooltip" title="Detail" data-detail="' + InputData.ID + '">';
    col7 += '<i class="bi bi-eye"></i>';
    col7 += '</button>';

    col7 += '<button type="button" class="btn btn-danger" data-toggle="tooltip" title="Delete" data-delete="' + InputData.ID + '">';
    col7 += ' <i class="bi bi-trash"></i>';
    col7 += '</button>';
    col7 += '</td>';
    rowTemp.push(col7);

    return rowTemp;
}

//Add input and remove dynamic
function DynamicAddWork() {
    // query all input and get max int, get card and button
    const inputArr = [...document.querySelectorAll(`[data-InputAdd]`),];
    if (inputArr.length < 10) {
        let no = parseInt(inputArr[inputArr.length - 1].getAttribute('data-InputAdd'));
        const cardElm = document.getElementById('cardAdd');
        const buttonElm = cardElm.querySelectorAll('button');

        //change old button to remove type
        buttonElm[buttonElm.length - 1].classList.remove('btn-outline-success');
        buttonElm[buttonElm.length - 1].classList.add('btn-outline-danger');
        buttonElm[buttonElm.length - 1].innerHTML = '<i class="bi bi-trash"></i>';
        buttonElm[buttonElm.length - 1].setAttribute('onclick', 'DynamicRemove(' + no + ')');
        buttonElm[buttonElm.length - 1].blur();
        no += 1
        //Add new button
        const stringHtmlInputAdd =
            '<div class="row mb-3" data-AddModalCard="' + no + '">' +
            '<div class="col-11" >' +
            '<input type="text" class="form-control" data-InputAdd="' + no + '" placeholder="Enter the work here...">' +
            '</div>' +
            '<div class="col-1">' +
            '<button type = "button" class="btn btn-outline-success" onclick = "DynamicAddWork()" >' +
            '<i class="bi bi-plus-lg"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
        cardElm.insertAdjacentHTML('beforeend', stringHtmlInputAdd);
    }
}
function DynamicRemove(no) {
    const cardElm = document.getElementById('cardAdd');
    cardElm.querySelector('[data-AddModalCard="' + no + '"]').remove();
}
//Edit input and remove dynamic
function DynamicEditWork() {
    // query all input and get max int, get card and button
    const inputArr = [...document.querySelectorAll(`[data-InputEdit]`),];
    let no = parseInt(inputArr[inputArr.length - 1].getAttribute('data-InputEdit'));
    const cardElm = document.getElementById('cardEdit');
    const buttonElm = cardElm.querySelectorAll('button');

    //change old button to remove type
    buttonElm[buttonElm.length - 1].classList.remove('btn-outline-success');
    buttonElm[buttonElm.length - 1].classList.add('btn-outline-danger');
    buttonElm[buttonElm.length - 1].innerHTML = '<i class="bi bi-trash"></i>';
    buttonElm[buttonElm.length - 1].setAttribute('onclick', 'DynamicEditRemove(' + no + ')');
    buttonElm[buttonElm.length - 1].blur();
    no += 1
    //Add new button
    const stringHtmlInputAdd =
        '<div class="row mb-3" data-EditModalCard="' + no + '">' +
        '<div class="col-11" >' +
        '<input type="text" class="form-control" data-InputEdit="' + no + '" placeholder="Enter the work here...">' +
        '</div>' +
        '<div class="col-1">' +
        '<button type = "button" class="btn btn-outline-success" onclick = "DynamicEditWork()">' +
        '<i class="bi bi-plus-lg"></i>' +
        '</button>' +
        '</div>' +
        '</div>';
    cardElm.insertAdjacentHTML('beforeend', stringHtmlInputAdd);
}
function DynamicEditRemove(no) {
    const cardElm = document.getElementById('cardEdit');
    cardElm.querySelector('[data-EditModalCard="' + no + '"]').remove();
}
// get date now (yyyy-mm-ddTHH:MM)
function GetDateToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hh = today.getHours();
    let MM = today.getMinutes();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (MM < 10) MM = '0' + MM;

    return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + MM;
}
// Random back color
function random_bg_color() {
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ")";
    return bgColor;
}
//Get name
function getName(Name) {
    let arrName = Name.split(' ');
    if (arrName.length < 2) {
        return (Name.charAt(0) + Name.charAt(1)).toUpperCase();
    }
    else {
        return (arrName[0].toString().charAt(0) + arrName[arrName.length - 1].toString().charAt(0)).toUpperCase();
    }
}
//Get cookies
function getCookie(name, item) {
    const cookieValue = decodeURIComponent(document.cookie).split(';').find(cookie => cookie.trim().startsWith(name + '='));
    let value = null;
    $.each(cookieValue.split('&'), function (k, v) {
        if (v.includes(item)) {
            value = getText(v, item + '=', '').toString();
        }
    });
    return value;
}
//Clear json text
function clearJson(sJson) {
    try {
        const obj = JSON.parse(sJson);
        const arr = Object.keys(obj).map((key) => `${key}: ${obj[key]}`);
        if (arr.length == 0) {
            return obj;
        }
        return arr.join('<br>');


    } catch {
        return sJson
    }
}
// Get text form string
function getText(Input, Start, End) {
    try {
        if (!Input.includes(Start)) {
            return Input;
        }
        let StartPos = Input.indexOf(Start) + Start.length;
        let dataBack = Input.substring(StartPos, Input.length);
        if (End == '') {
            dataBack = dataBack.substring(0, dataBack.length);
            return dataBack.trim();
        }
        dataBack = dataBack.substring(0, dataBack.indexOf(End));
        return dataBack.trim();
    } catch {
        return Input;
    }
}
// Get Date from timestamp (full = full date, date = only date, time = only time)
function GetDateString(date, isOnly = "Full") {
    let dateStart = new Date(parseInt(getText(date, "Date(", ")")));
    const yyyy = dateStart.getFullYear();
    let mm = dateStart.getMonth() + 1; // Months start at 0!
    let dd = dateStart.getDate();
    let hh = dateStart.getHours();
    let MM = dateStart.getMinutes();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (MM < 10) MM = '0' + MM;

    if (isOnly == "Full") {
        if (date == null) {
            return '0000-00-00 00:00';
        }
        return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + MM;
    }
    if (isOnly == "Date") {
        if (date == null) {
            return '0000-00-00';
        }
        return yyyy + '-' + mm + '-' + dd;
    }
    if (isOnly == "Time") {
        if (date == null) {
            return '00:00';
        }
        return hh + ':' + MM;
    }
    if (isOnly == "Month") {
        if (date == null) {
            return '00';
        }
        return mm;
    }
    if (isOnly == "DateTime") {
        if (date == null) {
            return '0000-00-00 00:00';
        }
        return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + MM;
    }
}
// Get user data to add model
function DrawUserList(infoUser, idList) {
    let dataList = document.getElementById(idList);

    dataList.innerHTML = '';
    for (let i = 0; i < infoUser.length; i++) {
        let opt = document.createElement('option');
        opt.value = infoUser[i].CardID;
        opt.innerHTML = infoUser[i].Department + ' - ' + infoUser[i].VnName + ' | ' + infoUser[i].CnName;
        dataList.appendChild(opt);
    }
}
function DrawUserListNormal(infoUser, idList) {
    let dataList = document.getElementById(idList);

    for (let i = 0; i < infoUser.length; i++) {
        if (getCookie("UserCookies", "Role") > 1) {
            if (getCookie("UserCookies", "Depart") == infoUser[i].Department) {
                let opt = document.createElement('option');
                opt.value = infoUser[i].CardID;
                $(opt).data('test', true);
                opt.innerHTML = infoUser[i].Department + ' - ' + infoUser[i].VnName + ' | ' + infoUser[i].CnName;
                dataList.appendChild(opt);
            }
        }
        else {
            let opt = document.createElement('option');
            opt.value = infoUser[i].CardID;
            opt.innerHTML = infoUser[i].Department + ' - ' + infoUser[i].VnName + ' | ' + infoUser[i].CnName;
            dataList.appendChild(opt);   
        }       
    }
}
//Draw avatar
function generateAvatar(text, foregroundColor = "white", backgroundColor = "black") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 120;
    canvas.height = 120;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "bold 60px sans-serif";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, (canvas.height / 2) + 5);

    return canvas.toDataURL("image/png");
}
//  Reset add, edit modal
function resetModal(idModal) {
    const modalElm = document.getElementById(idModal);
    let inputArr = [...modalElm.querySelectorAll('input'),];
    let arrL = inputArr.length;
    for (let i = 0; i < arrL; i++) {
        if (inputArr[i].getAttribute('disabled') == null)
            inputArr[i].value = "";
    }

    const inputDycnamic = [...document.querySelectorAll('[data-addmodalcard]'),];
    for (let i = 0; i < inputDycnamic.length - 1; i++) {
        inputDycnamic[i].remove();
    }
    const inputDycnamic1 = [...document.querySelectorAll('[data-EditModalCard]'),];
    for (let i = 0; i < inputDycnamic1.length; i++) {
        inputDycnamic1[i].remove();
    }
    modalElm.querySelector('textarea').value = "";
}
// DrawModelList
function DrawModelList(models, id_list) {
    let dataList = document.getElementById(id_list);

    dataList.innerHTML = '';
    for (let i = 0; i < models.length; i++) {
        let opt = document.createElement('option');
        opt.value = models[i].Model_;
        dataList.appendChild(opt);
    }
}
//Check data
function CheckData(data) {
    if (data.DateStart == '' || data.DateStart == 'null' || data.DateStart == null || data.DateStart == 'undefined') {
        toastr["warning"]('Please double check Date Start', 'Warning');
        return false;
    }
    if (data.DueDate == '' || data.DueDate == 'null' || data.DueDate == null || data.DueDate == 'undefined') {
        toastr["warning"]('Please double check Due Start', 'Warning');
        return false;
    }
    if (data.OwnerReceive == '' || data.OwnerReceive == 'null' || data.OwnerReceive == null || data.OwnerReceive == 'undefined') {
        toastr["warning"]('Please double check Owner Receive', 'Warning');
        return false;
    }
    if (data.OwnerRequest == '' || data.OwnerRequest == 'null' || data.OwnerRequest == null || data.OwnerRequest == 'undefined') {
        toastr["warning"]('Please double check Owner Request', 'Warning');
        return false;
    }
    if (data.WorkDes == '' || data.WorkDes == 'null' || data.WorkDes == null || data.WorkDes == 'undefined') {
        toastr["warning"]('Please double check Work', 'Warning');
        return false;
    }
    return true;
    
}
// Add model to headTable
function DrawModelTableHead(models, id_head) {
    $(`#${id_head}`).html('');

    $(`#${id_head}`).append($('<option>', {text: 'Model'}));

    $.each(models, function (k, v) {
        $(`#${id_head}`).append($('<option>', {
            text: v.Model_
        }));
    }); 
}
// Filter
function SelectedFilter(type) {
    if ($('#titlePage').text() == 'EVM') {
        let ModelSelected = ($('#ModelSelected').val() != 'Model') ? $('#ModelSelected').val() : '';
        let StatusSelected = ($('#StatusSelect').val() != 'Status') ? $('#StatusSelect').val() : '';
        dataTable.search(ModelSelected, 1, StatusSelected, 6);
    } else {
        const CTFSelected = $('#CTFSelect').val();;
        const ModelSelected = $('#ModelSelect').val();;
        const TypeSelected = $('#TypeSelect').val();;
        const StatusSelected = $('#StatusSelect').val();

        if (CTFSelected == 'CTF' && ModelSelected == 'Model' && TypeSelected == 'Type' && StatusSelected == 'Status') {
            dataTable.search('');
            return;
        }

        switch (type) {
            case 'CTF': {
                if (CTFSelected == 'CTF') {
                    dataTable.search('', 1);
                } else {
                    dataTable.search(CTFSelected, 1);
                }               
                break;
            }
            case 'Model': {  
                if (ModelSelected == 'Model') {
                    dataTable.search('', 2);
                } else {
                    dataTable.search(ModelSelected, 2);
                }   
                break;
            }
            case 'Type': {    
                if (TypeSelected == 'Type') {
                    dataTable.search('', 3);
                } else {
                    dataTable.search(TypeSelected, 3);
                }   
                break;
            }
            case 'Status': {
                if (StatusSelected == 'Status') {
                    dataTable.search('', 7);
                } else {
                    dataTable.search(StatusSelected, 7);
                }
                break;
            }
            
        }
    }
}

function InfoUserClick(elm, e) {
    e.preventDefault();
    const id = $(elm).data('cardid');
    window.location.href = `${window.location.protocol}//${window.location.host}/Manager/Manager/Dashboard`;
    window.localStorage.setItem('DashboardId', id);
}