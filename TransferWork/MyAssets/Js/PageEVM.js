$(function () {
    CreateTable();
});

// Add row input dynamic
function AddItemDnm() {  
    // query all input and get max int, get card and button   
    let container = document.getElementById('DnmContainer');
    let itemArr = [...container.querySelectorAll(`[data-RowIndex]`),];

    if (itemArr.length < 11) {
        let index = parseInt(itemArr[itemArr.length - 1].getAttribute('data-RowIndex'));
        let refreshBtn = container.querySelectorAll('.btn-outline-info');
        let plusBtn = container.querySelectorAll('.btn-outline-success');
        refreshBtn = refreshBtn[refreshBtn.length - 1];
        plusBtn = plusBtn[plusBtn.length - 1];
        //sn text
        const selector = container.querySelector('[data-RowIndex="' + index + '"]').querySelectorAll('input');
        let snText = selector[0].value;
        let itemText = selector[1].value;
        let valueText = selector[2].value;
        //refresh button
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('btn-outline-info');
        refreshBtn.classList.add('btn-outline-secondary');
        //plus button
        plusBtn.classList.remove('btn-outline-success');
        plusBtn.classList.add('btn-outline-danger');
        plusBtn.innerHTML = '<i class="bi bi-trash"></i>';
        plusBtn.setAttribute('onclick', 'RemoveItemDnm(' + index +')');
        plusBtn.blur();
        index++;
        ////Add new row
        container.dataset.rowcount = index;
        let html = '';
        html += '<div class="row AddDNM" data-RowIndex="' + index + '">';
        html += '    <div class="col-2"><input type="text" class="form-control" value="' + snText +'"></div>';
        html += '    <div class="col-6"><input type="text" class="form-control" value="' + itemText +'"></div>';
        html += '    <div class="col-2"><input type="text" class="form-control" value="' + valueText +'"></div>';
        html += '    <div class="col-2">';
        html += '        <button type="button" class="btn btn-outline-info" onclick="Refesh(' + index + ')"><i class="bi bi-arrow-clockwise"></i></button>';
        html += '        <button type="button" class="btn btn-outline-success" style="margin-left: 15px;" onclick="AddItemDnm()"><i class="bi bi-plus-lg"></i></button>';
        html += '    </div>';
        html += '</div>';
        container.insertAdjacentHTML('beforeend', html)
    } else {
        toastr["info"]('Item max = 10 rows. Please add new Record', 'MAX LENGHT');
    }
}
// Remove row input
function RemoveItemDnm(index) {
    let elementIndex = document.querySelector('[data-RowIndex="' + index + '"]').remove();
}
// reset value input
function Refesh(index) {
    document.querySelector('.btn-outline-info').blur();
    let elementIndex = document.querySelector('[data-RowIndex="' + index + '"]');
    let input = elementIndex.querySelectorAll('input');
    for (let i = 0; i < input.length; i++) {
        input[i].value = '';
    };
}
// Reset modal
function refreshModal() {   
    let addModal = document.getElementById('DnmContainer');
    let rowArr = addModal.querySelectorAll('[data-RowIndex]');
    if (rowArr.length > 2) {
        for (let i = 0; i < rowArr.length; i++) {
            rowArr[i].remove();
        }
    }
    let inputArr = document.getElementById('AddEvm').querySelectorAll('input');
    for (let i = 0; i < rowArr.length; i++) {
        if (inputArr[i].getAttribute('disabled') == null) {
            inputArr[i].value = '';
        }
    }   
}
// Render data to row
function DrawRow(data) {
    let rowTemp = []; // init

    // Col 1
    let col0 = '<td class="e_col_1">' + data.ID + '</td>';
    rowTemp.push(col0);

    // Col 2
    let col1 = '<td class="e_col_2">';
    col1 += '<label class="col-12"><b>' + GetDateString(data.Date, "Date") + '</b></label>';
    col1 += '<label class="col-12">' + GetDateString(data.Date, "Time") + '</label>';
    col1 += '</td>';
    rowTemp.push(col1);

    // Col 3
    let col2 = '<td class="e_col_3">' + data.Model + '</td>';
    rowTemp.push(col2);

    let detail = JSON.parse(data.Detail);
    // Col 4
    let col3 = '<td class="e_col_4">';
    $.each(detail, function (k, v) {
        if (k > 3) {
            return;
        }
        if (k < 3) {
            col3 += '<p class="text-over">' + v.SN + '</p>';
        }
        if (k == 3) {
            col3 += '<p class="text-over" style="border: 0">...</p>';
        }        
    });    
    rowTemp.push(col3);   
    //col 5
    let col4 = '<td class="e_col_5">';
    $.each(detail, function (k, v) {
        if (k > 3) {
            return;
        }
        if (k < 3) {
            col4 += '<p class="text-over">' + v.Item + '</p>';
        }
        if (k == 3) {
            col4 += '<p class="text-over" style="border: 0">...</p>';
        }
    });    
    rowTemp.push(col4);   
    //col 6
    let col5 = '<td class="e_col_6">';
    $.each(detail, function (k, v) {
        if (k > 3) {
            return;
        }
        if (k < 3) {
            col5 += '<p class="text-over">' + v.Value + '</p>';
        }
        if (k == 3) {
            col5 += '<p class="text-over" style="border: 0">...</p>';
        }
    });    
    rowTemp.push(col5);   
    // Col 7
    let owner = data.Owner.split(',');
    let col6 = '<td class="col_4">';
    col6 += '<label class="col-12">' + owner[1] + ' - ' + owner[4] + ' </label>';
    col6 += '<a href="/Dashboard/' + owner[0] + '" class="col-12">' + owner[2] + '</a>';
    col6 += '</td>';
    rowTemp.push(col6);
    // Col 8
    let col7 = "";
    switch (data.Status) {
        case "On-going": {
            col7 += '<td class="col_6"><span class="badge rounded-pill bg-warning text-dark">On-going</span></td>';
            break;
        }
        case "Open": {
            col7 += '<td class="col_6"><span class="badge rounded-pill bg-danger">Open</span></td>';
            break;
        }
        case "Done": {
            col7 += '<td class="col_6"><span class="badge rounded-pill bg-success">Done</span></td>';
            break;
        }
        case "Close": {
            col7 += '<td class="col_6"><span class="badge rounded-pill bg-secondary">Close</span></td>';
            break;
        }
        default: {
            col7 += '<td class="col_6"><span class="badge rounded-pill bg-secondary"></span></td>';
        }
    }
    rowTemp.push(col7);

    // Col 9
    let col8 = '<td class="col_7">';

    col8 += '<button type="button" class="btn btn-warning" data-toggle="tooltip" title="Edit" data-e_edit="' + data.ID + '">';
    col8 += '<i class="bi bi-pencil-square"></i>';
    col8 += '</button>';

    col8 += '<button type="button" class="btn btn-info" data-toggle="tooltip" title="Detail" data-e_detail="' + data.ID + '">';
    col8 += '<i class="bi bi-eye"></i>';
    col8 += '</button>';

    col8 += '<button type="button" class="btn btn-danger" data-toggle="tooltip" title="Delete" data-e_delete="' + data.ID + '">';
    col8 += ' <i class="bi bi-trash"></i>';
    col8 += '</button>';
    col8 += '</td>';
    rowTemp.push(col8);

    return rowTemp;
}
//create data to table
function CreateTable () {
    $.ajax({
        type: "GET",
        url: "/HandoverEVM/Works/GetListWork",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            dataTable.rows().remove('all'); 
            DrawUserList(res.infoUser, 'add_listOwnerEvm');
            DrawUserList(res.infoUser, 'edit_listOwnerEvm');

            DrawModelList(res.model, 'evm_model_datalist');
            DrawModelTableHead(res.model, 'ModelSelected');

            switch (res.status) {
                case 'success': {                    
                    toastr["success"]('Get datatable success!', 'DONE');
                    $.each(res.data, function (key, value) {
                        dataTable.rows().add(DrawRow(value));
                    });
                    return;
                }
                case 'fail': {
                    toastr["error"](res.err, 'SERVER ERROR');
                    return;
                }
                default: {
                    toastr["error"]('Opps!!! Unspecified error.', 'ERROR');
                }
            }
        },
        error: function (err) {
            toastr["error"]('Connect to server error', 'CONNECT ERROR');
            console.log(err);
        }
    });
};
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
// Add row input dynamic
function EditItemDnm() {
    // query all input and get max int, get card and button   
    let container = document.getElementById('EditContainer');
    let itemArr = [...container.querySelectorAll(`[data-RowIndex]`),];

    if (itemArr.length < 11) {
        let index = parseInt(itemArr[itemArr.length - 1].getAttribute('data-RowIndex'));
        let refreshBtn = container.querySelectorAll('.btn-outline-info');
        let plusBtn = container.querySelectorAll('.btn-outline-success');
        refreshBtn = refreshBtn[refreshBtn.length - 1];
        plusBtn = plusBtn[plusBtn.length - 1];
        //sn text
        const selector = container.querySelector('[data-RowIndex="' + index + '"]').querySelectorAll('input');
        let snText = selector[0].value;
        let itemText = selector[1].value;
        let valueText = selector[2].value;
        //refresh button
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('btn-outline-info');
        refreshBtn.classList.add('btn-outline-secondary');
        //plus button
        plusBtn.classList.remove('btn-outline-success');
        plusBtn.classList.add('btn-outline-danger');
        plusBtn.innerHTML = '<i class="bi bi-trash"></i>';
        plusBtn.setAttribute('onclick', 'RemoveItemDnm(' + index + ')');
        plusBtn.blur();
        index++;
        ////Add new row
        container.dataset.rowcount = index;
        let html = '';
        html += '<div class="row AddDNM" data-RowIndex="' + index + '">';
        html += '    <div class="col-2"><input type="text" class="form-control" value="' + snText + '"></div>';
        html += '    <div class="col-6"><input type="text" class="form-control" value="' + itemText + '"></div>';
        html += '    <div class="col-2"><input type="text" class="form-control" value="' + valueText + '"></div>';
        html += '    <div class="col-2">';
        html += '        <button type="button" class="btn btn-outline-info" onclick="Refesh(' + index + ')"><i class="bi bi-arrow-clockwise"></i></button>';
        html += '        <button type="button" class="btn btn-outline-success" style="margin-left: 15px;" onclick="EditItemDnm()"><i class="bi bi-plus-lg"></i></button>';
        html += '    </div>';
        html += '</div>';
        container.insertAdjacentHTML('beforeend', html)
    } else {
        toastr["info"]('Item max = 10 rows. Please add new Record', 'MAX LENGHT');
    }
}
function makeHistory(data) {
    let temp = JSON.parse(data);
    let returnvalue = '';
    for (let k in temp) {
        returnvalue += k + ' | ' + temp[k].SN + ', ' + temp[k].Item + ', ' + temp[k].Value + '<br>';
    }
    return returnvalue;
}


//  Show Add modal
function AddEVM_Open() {
    $('#AddEvm').modal('show');
    refreshModal();
    document.getElementById("evm_date").value = GetDateToday();
}
//  Add EVM Event
function SaveEVM() {
    //Control data
    let data = {
        ID: null,
        Date: $('#evm_date').val(),
        Model: $('#evm_model').val(),
        Owner: $('#evm_owner').val(),
        Status: $('#evm_status').val(),
    }
    if (data.Owner == '' || data.Model == '') {
        toastr["warning"]('Please input Owner or Model!', 'Owner or Model Null');
        return;
    }
    const container = document.getElementById('DnmContainer');
    const rowArr = [...container.querySelectorAll(`[data-RowIndex]`),];
    const leng = rowArr.length;
    if (leng > 1) {
        data.Detail = '{';
        for (let i = 0; i < leng - 1; i++) {
            let inputArr = rowArr[i].querySelectorAll('input');
            if (i < leng - 2) {
                data.Detail += '"' + (i + 1) + '":{"SN":"' + inputArr[0].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Item":"' + inputArr[1].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Value":"' + inputArr[2].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '"},';
            }
            else {
                data.Detail += '"' + (i + 1) + '":{"SN":"' + inputArr[0].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Item":"' + inputArr[1].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Value":"' + inputArr[2].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '"}';
            }
        }
        data.Detail += '}';
    }
    else {
        toastr["warning"]('Please click (+) button after enter work!', 'Data Null');
        return;
    }

    //Send to server
    $.ajax({
        url: "/HandoverEVM/Works/AddEVM",
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (respon) {
            let dataRes = respon.dataRow;
            switch (respon.status) {
                case 'success': {
                    toastr["success"](data.Owner + ' | Create EVM Success!');
                    $('#AddEvm').modal('hide');
                    dataTable.rows().add(DrawRow(dataRes));

                    DrawModelList(res.model, 'evm_model_datalist');
                    DrawModelTableHead(res.model, 'ModelSelected');

                    return;
                }
                case 'Owner null': {
                    toastr["warning"]('Owner null! Please enter Owner', 'Warning');
                    return;
                }
                case 'Date fail': {
                    toastr["warning"]('Date is not selected or earlier than 2000. Please check again!', 'Warning');
                    return;
                }
                case 'Status null': {
                    toastr["warning"]('Owner Receive null! Please enter Owner', 'Warning');
                    return;
                }
                case 'fail': {
                    toastr["error"](respon.err, 'SERVER ERROR');
                    return;
                }
                default: {
                    toastr["info"]('Please contact to fix it!', 'Send Add Fail');
                    return;
                }
            };
        },
        error: function (err) {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
        }
    });

}
//  Show Edit Modal
$(document).on("click", "[data-e_edit]", function (e) {
    e.preventDefault();
    this.blur();

    let id = $(this).data('e_edit');
    let index = $(this).parent().parent().index();
    let btn = document.getElementById('SaveBtn');
    btn.setAttribute('data-id', id);
    btn.setAttribute('data-index', index);

    let cardidRQ = 'V' + getText($(this).parent().parent()[0].childNodes[6].children[1].href, '/V', '');
    if (getCookie('UserCookies', 'Role') == '3' && cardidRQ != getCookie('UserCookies', 'CardID')) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/HandoverEVM/Works/GetWork/" + id,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            refreshModal();
            let work = res.data;

            /* Check Permission*/
            const role = getCookie("UserCookies", "Role");
            if (role == 3 && work.Owner != getCookie("UserCookies", "CardID")) {
                return;
            }
            /* End */

            switch (res.status) {
                case 'success': {
                    document.getElementById('evm_EditHead').innerHTML = 'EDIT EVM - ID: ' + work.ID;
                    document.getElementById('evm_date_edit').value = GetDateString(work.Date);
                    document.getElementById('evm_owner_edit').value = work.Owner;
                    document.getElementById('evm_status_edit').value = work.Status;
                    document.getElementById('evm_model_edit').value = work.Model;

                    { // Dynamic Input
                        let containers = document.getElementById('EditContainer');
                        containers.innerHTML = '';
                        const arrEVM = JSON.parse(work.Detail)
                        let max = 0;
                        $.each(arrEVM, function (key, value) {
                            max = key;
                            let html = '';
                            html += '<div class="row AddDNM" data-RowIndex="' + key + '">';
                            html += '    <div class="col-2"><input type="text" class="form-control" value="' + value.SN + '"></div>';
                            html += '    <div class="col-6"><input type="text" class="form-control" value="' + value.Item + '"></div>';
                            html += '    <div class="col-2"><input type="text" class="form-control" value="' + value.Value + '"></div>';
                            html += '    <div class="col-2">';
                            html += '        <button type="button" class="btn btn-outline-secondary" onclick="Refesh(' + key + ')" disabled><i class="bi bi-arrow-clockwise"></i></button>';
                            html += '        <button type="button" class="btn btn-outline-danger" style="margin-left: 15px;" onclick="RemoveItemDnm(' + key + ')"><i class="bi bi-trash"></i></button>';
                            html += '    </div>';
                            html += '</div>';
                            containers.insertAdjacentHTML('beforeend', html)
                        });
                        max++;
                        let html = '';
                        html += '<div class="row AddDNM" data-RowIndex="' + max + '">';
                        html += '    <div class="col-2"><input type="text" class="form-control"></div>';
                        html += '    <div class="col-6"><input type="text" class="form-control"></div>';
                        html += '    <div class="col-2"><input type="text" class="form-control"></div>';
                        html += '    <div class="col-2">';
                        html += '        <button type="button" class="btn btn-outline-info" onclick="Refesh(' + max + ')"><i class="bi bi-arrow-clockwise"></i></button>';
                        html += '        <button type="button" class="btn btn-outline-success" style="margin-left: 15px;" onclick="EditItemDnm()" data-name="edit"><i class="bi bi-plus-lg"></i></button>';
                        html += '    </div>';
                        html += '</div>';
                        containers.insertAdjacentHTML('beforeend', html)
                    }
                    $('#EditEvm').modal('show');
                    return;
                }
                default: {
                    toastr["info"]('Please contact to fix it!', 'Show Edit Fail');
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});
// EDIT
function SaveEVM_Edit() {
    const btn = document.getElementById('SaveBtn');
    let id = btn.getAttribute('data-id');
    let index = btn.getAttribute('data-index');
    //Control data
    let data = {
        ID: id,
        Date: $('#evm_date_edit').val(),
        Model: $('#evm_model_edit').val(),
        Owner: $('#evm_owner_edit').val(),
        Status: $('#evm_status_edit').val(),
    }
    if (data.Owner == '' || data.Model == '') {
        toastr["warning"]('Please input Owner or Model!', 'Owner or Model Null');
        return;
    }
    const container = document.getElementById('EditContainer');
    const rowArr = [...container.querySelectorAll(`[data-RowIndex]`),];
    const leng = rowArr.length;
    if (leng > 1) {
        data.Detail = '{';
        for (let i = 0; i < leng - 1; i++) {
            let inputArr = rowArr[i].querySelectorAll('input');
            if (i < leng - 2) {
                data.Detail += '"' + (i + 1) + '":{"SN":"' + inputArr[0].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Item":"' + inputArr[1].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Value":"' + inputArr[2].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '"},';
            }
            else {
                data.Detail += '"' + (i + 1) + '":{"SN":"' + inputArr[0].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Item":"' + inputArr[1].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '","Value":"' + inputArr[2].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '"}';
            }
        }
        data.Detail += '}';
    }
    else {
        toastr["warning"]('Please click (+) button after enter work!', 'Data Null');
        return;
    }

    const sendData = {
        evm: data,
        changeTime: GetDateToday().replace('T', ' '),
        userChange: getCookie('UserCookies', 'CardID'),
    }

    //Send to server
    $.ajax({
        url: "/HandoverEVM/Works/EditWork",
        data: JSON.stringify(sendData),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (respon) {
            let dataRes = respon.dataRow;
            $('#EditEvm').modal('hide');
            switch (respon.status) {
                case 'Edit success': {
                    toastr["success"]('Update work success', dataRes.ID + ' | ' + GetDateString(dataRes.Date).replace('T', ' '));
                    dataTable.rows().updateRow(index, DrawRow(dataRes));

                    DrawModelList(res.model, 'evm_model_datalist');
                    DrawModelTableHead(res.model, 'ModelSelected');

                    return;
                }
                case 'Owner null': {
                    toastr["warning"]('Owner null! Please enter Owner', 'Warning');
                    return;
                }
                case 'Date fail': {
                    toastr["warning"]('Date is not selected or earlier than 2000. Please check again!', 'Warning');
                    return;
                }
                case 'Type null': {
                    toastr["warning"]('Date is not selected or earlier than 2000. Please check again!', 'Warning');
                    return;
                }
                case 'Status null': {
                    toastr["warning"]('Owner Receive null! Please enter Owner', 'Warning');
                    return;
                }
                case 'Double check Owner': {
                    toastr["warning"]('Owner Request and Owner Receive are same. Please check again!', 'Warning');
                    return;
                }
                case 'CARD ID FAIL': {
                    toastr["error"]('Please double check Card ID!', 'WRONG CARD ID');
                    return;
                }
                case 'fail': {
                    toastr["error"](respon.err, 'SERVER ERROR');
                }
                default: {
                    toastr["info"]('Please contact to fix it!', 'Send Edit Fail');
                    return;
                }
            };
        },
        error: function () {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            $('#EditWorkModal').modal('hide');
        }
    });

}
//  Show Detail Modal
$(document).on("click", "[data-e_detail]", function (e) {
    e.preventDefault;
    this.blur();

    let id = $(this).data('e_detail');
    let cardidRQ = 'V' + getText($(this).parent().parent()[0].childNodes[6].children[1].href, '/V', '');


    $.ajax({
        type: "GET",
        url: "/HandoverEVM/Works/GetWork/" + id,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            switch (res.status) {
                case 'success': {
                    const evm = res.data;

                    const user = res.ownerData;
                    //Card Header
                    document.getElementById('evmModalHead').innerHTML = 'DETAIL WORK - ID: ' + evm.ID;
                    //Card Status
                    let cardStatus = document.getElementById('card_Status');
                    cardStatus.style.boxShadow = "none";
                    switch (evm.Status) {
                        case 'On-going': {
                            cardStatus.style.backgroundColor = "#ffc107";
                            cardStatus.style.color = "#000";
                            cardStatus.querySelector('p').innerHTML = 'On-going';
                            break;
                        }
                        case 'Done': {
                            cardStatus.style.backgroundColor = "#198754";
                            cardStatus.style.color = "#fff";

                            cardStatus.querySelector('p').innerHTML = 'Done';
                            break;
                        }
                        case 'Open': {
                            cardStatus.style.backgroundColor = "#dc3545";
                            cardStatus.style.color = "#fff";
                            cardStatus.querySelector('p').innerHTML = 'Open';
                            break;
                        }
                        case 'Close': {
                            cardStatus.style.backgroundColor = "#6c757d";
                            cardStatus.style.color = "#fff";
                            cardStatus.querySelector('p').innerHTML = 'Close';
                            break;
                        }
                    }
                    //Card Model
                    document.getElementById('card_Model').innerHTML = evm.Model;
                    //Card Date
                    document.getElementById('card_Date').innerHTML = GetDateString(evm.Date).replace('T', ' | ')
                    //Card Owner
                    //      - Avatar
                    document.getElementById("avtOwner").src = generateAvatar(getName(user.VnName), "white", random_bg_color());
                    //      - Set infor
                    let info = document.getElementById('infoOwner');
                    info.innerHTML = "";
                    info.innerHTML += '<p>' + user.CardID + '</p>';
                    info.innerHTML += '<p>' + user.VnName + '</p>';
                    info.innerHTML += '<p>' + user.Department + '</p>';
                    //Card Description
                    let descc = document.getElementById('cardItems');
                    if (evm.Detail != null) {
                        const item = JSON.parse(evm.Detail);
                        let html = '';
                        html += '<div class="row" style="border-bottom: 1px solid #d5d5d5">';
                        html += '<div class="col-3"><h5><b>SN</b></h5></div>';
                        html += '<div class="col-6"><h5><b>Item</b></h5></div>';
                        html += '<div class="col-3"><h5><b>Value</b></h5></div>';
                        html += '</div>';
                        $.each(item, function (k, v) {
                            html += '<div class="row" style="margin-top: 1rem; border-bottom: 1px solid #d5d5d5">';
                            html += '<div class="col-3"><p>' + v.SN + '</p></div>';
                            html += '<div class="col-6"><p>' + v.Item + '</p></div>';
                            html += '<div class="col-3"><p>' + v.Value + '</p></div>';
                            html += '</div>';
                        });
                        descc.innerHTML = html;
                    }
                    //Card History
                    let HistoryElm = document.getElementById('evmLog');
                    document.getElementById('cardHistory').hidden = true;
                    const role = getCookie("UserCookies", "Role");
                    if (role < 3 || evm.Owner == getCookie("UserCookies", "CardID")) {
                        if (!(getCookie('UserCookies', 'Role') == '3' && cardidRQ != getCookie('UserCookies', 'CardID'))) {
                            HistoryElm.innerHTML = '';
                            makeHistory(evm.History);
                            if (evm.History != null) {
                                let log = Object.entries(JSON.parse(evm.History)).reverse();
                                $.each(log, function (key, value) {
                                    if (value[1].length > 0) {
                                        let html = '';
                                        html += '<div data-vtdate="<b>' + value[0] + '</b>">';
                                        $.each(value[1], function (k, v) {

                                            html += '<h3><b>' + v.Action + '</b></h3>';
                                            html += '<b>User change: <a href="/Dashboard/' + v.User + '"> ' + v.User + '</a></b>';
                                            html += '<div class="row">'
                                            html += '<div class="col-3"><b>Before:</b></div>'
                                            if (v.Action == 'Item') {
                                                html += '<div class="col-9"><p>' + makeHistory(v.Old) + '</p></div></div>'
                                                html += '<div class="row">'
                                                html += '<div class="col-3"><b>After:</b></div>'
                                                html += '<div class="col-9"><p>' + makeHistory(v.New) + '</p></div></div>'
                                            }
                                            else if (v.Action = 'Date') {
                                                html += '<div class="col-9"><p>' + clearJson(v.Old).replace('T', ' ') + '</p></div></div>'
                                                html += '<div class="row">'
                                                html += '<div class="col-3"><b>After:</b></div>'
                                                html += '<div class="col-9"><p>' + clearJson(v.New).replace('T', ' ') + '</p></div></div>'
                                            }
                                            else {
                                                html += '<div class="col-9"><p>' + clearJson(v.Old) + '</p></div></div>'
                                                html += '<div class="row">'
                                                html += '<div class="col-3"><b>After:</b></div>'
                                                html += '<div class="col-9"><p>' + clearJson(v.New) + '</p></div></div>'
                                            }
                                        });
                                        html += '</div>';
                                        HistoryElm.innerHTML += html;
                                    }
                                });
                                $('#evmLog').verticalTimeline({
                                    startLeft: false,
                                    alternate: true,
                                    animate: "Slide",
                                    arrows: false
                                });
                                document.getElementById('cardHistory').hidden = false;
                            }
                        }
                    }

                    //Show Modal
                    $('#evmDetailModal').modal('show');
                    return;
                }
                default: {
                    toastr["info"]('Please contact to fix it!', 'Show Detail Fail');
                }
            }
        },
        error: function () {

        }
    });
});
//  Show Detele Modal
$(document).on("click", "[data-e_delete]", function (e) {
    e.preventDefault();
    this.blur();
    let id = $(this).data('e_delete');
    let index = $(this).parent().parent().index();
    let btn = document.getElementById('deleteBtn');

    btn.setAttribute('data-id', id);
    btn.setAttribute('data-index', index);

    const _row = $(this).parent().parent()[0];

    let cardidRQ = 'V' + getText(_row.childNodes[6].children[1].href, '/V', '');
    if (getCookie('UserCookies', 'Role') == '3' && cardidRQ != getCookie('UserCookies', 'CardID')) {
        return;
    }

    let dateCreate = _row.childNodes[1].children[0].children[0].innerHTML + " " + _row.childNodes[1].children[1].innerHTML;
    let model = _row.childNodes[2].innerHTML;
    let owner = (_row.childNodes[6].children[1].innerHTML + " | " + _row.childNodes[6].children[0].innerHTML).replace('(', '').replace(')', '');

    document.getElementById('deleteModalHead').innerHTML = 'DELETE RECORD - ' + id;

    let _ul = '<ul>'
    _ul += '<li class="row"><b class="col-4">Date created:</b><lable class="col-8">' + dateCreate + '</lable></li>';
    _ul += '<li class="row"><b class="col-4">Model:</b><lable class="col-8">' + model + '</lable></li>';
    _ul += '<li class="row"><b class="col-4">Owner:</b><lable class="col-8">' + owner + '</lable></li>';

    let title = '<p class="text-danger">This action is irreversible, do you want to proceed?</p>';

    let deleteModalBody = document.getElementById('delete_CardBody');
    deleteModalBody.innerHTML = _ul;
    deleteModalBody.innerHTML += title;

    $.ajax({
        type: "GET",
        url: "/HandoverEVM/Works/GetWork/" + id,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            const work = res.data;
            /* Check Permission*/
            const role = getCookie("UserCookies", "Role");
            if (role == 3 && work.Owner != getCookie("UserCookies", "CardID")) {
                return
            }
            //Show Modal
            $('#DeleteWorkModal').modal('show');
        },
        error: function () {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
        }
    });
});
// DELETE
function DeteleWork() {
    const btn = document.getElementById('deleteBtn');
    let id = btn.getAttribute('data-id');
    let index = btn.getAttribute('data-index');

    $.ajax({
        type: "POST",
        url: "/HandoverEVM/Works/DeleteWork/" + id,
        dataType: "json",
        success: function (res) {
            switch (res.status) {
                case "success": {
                    toastr["success"]('Delete work success!', 'SUCCESS');
                    dataTable.rows().remove(index);
                    return;
                }
                case "not access": {
                    toastr["error"]('You do not have permission to perform this action. This action is only available to the Requester or the Receiver!', "Don't have permission");
                    return;
                }
                default: {
                    toastr["info"]('Please contact to fix it!', 'Send Delete Fail');
                }
            }
        },
        error: function () {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
        }
    });
    $('#DeleteWorkModal').modal('hide');
}