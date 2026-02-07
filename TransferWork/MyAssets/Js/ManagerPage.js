var pieChart;
var colChart;
var userStatusChart;
var dateTimeNow = new Date(Date.now());
var CheckUserList = false;
var ThisUser = '';

$(function () {
    ThisUser = $('#info_ID').text();
    PieChartInit();
    ColChartInit();
    UserStatusChartInit();
    
    if (window.localStorage.getItem('DashboardId') != null) {
        $('#TypeSelectData').val(window.localStorage.getItem('DashboardId'));
        GetDataDashboard(null, true, true);
        window.localStorage.removeItem('DashboardId');
    }
    else {
        GetDataDashboard(null, true, true);
    }
    
});

// sub menu event
{
    var theToggle = document.getElementById('toggle');
    // hasClass
    function hasClass(elem, className) {
        return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
    }
    // addClass
    function addClass(elem, className) {
        if (!hasClass(elem, className)) {
            elem.className += ' ' + className;
        }
    }
    // removeClass
    function removeClass(elem, className) {
        var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
        if (hasClass(elem, className)) {
            while (newClass.indexOf(' ' + className + ' ') >= 0) {
                newClass = newClass.replace(' ' + className + ' ', ' ');
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    }
    // toggleClass
    function toggleClass(elem, className) {
        var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, " ") + ' ';
        if (hasClass(elem, className)) {
            while (newClass.indexOf(" " + className + " ") >= 0) {
                newClass = newClass.replace(" " + className + " ", " ");
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        } else {
            elem.className += ' ' + className;
        }
    }
    theToggle.onclick = function () {
        toggleClass(this, 'on');
        return false;
    }
}
// Chart Init
function PieChartInit() {
    var options = {
        series: [],
        noData: {
            text: 'No data to display',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '18px',
                color: '#777'
            }
        },
        chart: {
            height: '412px',
            type: 'pie',
        },
        labels: ['On-going', 'Done', 'Open', 'Close'],
        colors: ['#ffc107', '#198754', '#dc3545', '#6c757d'],
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    pieChart = new ApexCharts(document.querySelector("#chart"), options);
    pieChart.render();
    
}
function ColChartInit() {
    var options = {
        series: [],
        noData: {
            text: 'No data to display',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '18px',
                color: '#777'
            }
        },
        colors: ['#ffc107', '#198754', '#dc3545', '#6c757d'],
        chart: {
            type: 'bar',
            height: '400px',
            toolbar: {
                show: false
            },
            events: {
                xAxisLabelClick: function (event, chartContext, config) {
                    const index = config.labelIndex;
                    GetDataDashboard(config.config.xaxis.categories[index], true, false);
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: [],
        },
        fill: {
            opacity: 1
        },
        
    };
    colChart = new ApexCharts(document.querySelector("#chart_2"), options);
    colChart.render();
}
function UserStatusChartInit() {
    var options = {
        series: [],
        noData: {
            text: 'No data to display',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '18px',
                color: '#777'
            }
        },
        colors: ['#ffc107', '#198754', '#dc3545', '#6c757d'],
        chart: {
            type: 'bar',
            height: '400px',
            stacked: true,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '60%'
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: []
        },
        legend: {
            position: 'top'
        }
    };

    userStatusChart = new ApexCharts(document.querySelector("#chart_user_status"), options);
    userStatusChart.render();
}
// Chart Data and Count Up
function CountUp(id, number) {
    const box = document.getElementById(id);
    box.dataset.count = number;

    let count = 0

    const countUp = setInterval(() => {
        let boxCount = box.dataset.count
        if (count == boxCount) clearInterval(countUp)
        box.innerHTML = count + box.dataset.unit
        //count = count + Math.floor((boxCount / 1))
        count++;
        if (count > boxCount) count = boxCount
    }, 50)
}
function CreateChartData(listWorks, updatePieChart, updateColChart) {
    // Pie Chart
    if (updatePieChart){
        let PieChartData = [0, 0, 0, 0];
        $.each(listWorks, function (key, value) {
            switch (value.Status) {
                case 'Done': {
                    PieChartData[1]++;
                    return;
                }
                case 'Close': {
                    PieChartData[3]++;
                    return;
                }
                case 'Open': {
                    PieChartData[2]++;
                    return;
                }
                case 'On-going': {
                    PieChartData[0]++;
                    return;
                }
            }
        });

        CountUp('Cout_OnGoing', PieChartData[0]);
        CountUp('Cout_Done', PieChartData[1]);
        CountUp('Cout_Open', PieChartData[2]);
        CountUp('Cout_Close', PieChartData[3]);

        if (PieChartData[0] == 0 && PieChartData[1] == 0 && PieChartData[2] == 0 && PieChartData[3] == 0) {
            pieChart.updateSeries([], true);
        }
        else {
            pieChart.updateSeries(PieChartData, true);
        }
    }
    // Column Chart
    if (updateColChart){
        const oldCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const CountMonth = new Array(12).fill(0);
        const ColChartData = [
            { name: 'On-going', data: new Array(12).fill(0) },
            { name: 'Done', data: new Array(12).fill(0) },
            { name: 'Open', data: new Array(12).fill(0) },
            { name: 'Close', data: new Array(12).fill(0) }
        ];
        const currentYear = new Date().getFullYear();

        listWorks.forEach(v => {
            const valueDate = new Date(parseInt(getText(v.DateStart, 'Date(', ')')));
            if (valueDate.getFullYear() === currentYear) {
                CountMonth[valueDate.getMonth()]++;
                switch (v.Status) {
                    case 'On-going':
                        ColChartData[0].data[valueDate.getMonth()]++;
                        break;
                    case 'Done':
                        ColChartData[1].data[valueDate.getMonth()]++;
                        break;
                    case 'Open':
                        ColChartData[2].data[valueDate.getMonth()]++;
                        break;
                    case 'Close':
                        ColChartData[3].data[valueDate.getMonth()]++;
                        break;
                }
            }
        });
        const newCategories = oldCategories.filter((month, i) => CountMonth[i] > 0);
        ColChartData.forEach(v => {
            v.data = v.data.filter((count, i) => CountMonth[i] > 0);
        });
        colChart.updateOptions({
            xaxis: {
                categories: newCategories
            },
            series: ColChartData
        })
    }
}

function UpdateStatusTotals(statusData) {
    const totalAll = statusData.reduce((sum, value) => sum + value, 0);
    $('#Total_OnGoing').text(statusData[0]);
    $('#Total_Done').text(statusData[1]);
    $('#Total_Open').text(statusData[2]);
    $('#Total_Close').text(statusData[3]);
    $('#Total_All').text(totalAll);
}

function UpdateUserStatusChart(listWorks, listUsers) {
    const statusKeys = ['On-going', 'Done', 'Open', 'Close'];
    const statusSeries = statusKeys.map(name => ({ name: name, data: [] }));
    const userMap = new Map();
    const categories = [];

    if (Array.isArray(listUsers)) {
        listUsers.forEach(user => {
            userMap.set(user.CardID, {
                label: `${user.CardID} - ${user.VnName}`,
                counts: [0, 0, 0, 0]
            });
        });
    }

    listWorks.forEach(work => {
        const ownerReceive = (work.OwnerReceive || '').split(',');
        ownerReceive.forEach(ownerId => {
            const trimmedId = ownerId.trim();
            if (!trimmedId) {
                return;
            }
            if (!userMap.has(trimmedId)) {
                userMap.set(trimmedId, { label: trimmedId, counts: [0, 0, 0, 0] });
            }
            const statusIndex = statusKeys.indexOf(work.Status);
            if (statusIndex >= 0) {
                userMap.get(trimmedId).counts[statusIndex] += 1;
            }
        });
    });

    userMap.forEach(value => {
        const hasData = value.counts.some(count => count > 0);
        if (hasData) {
            categories.push(value.label);
            value.counts.forEach((count, index) => {
                statusSeries[index].data.push(count);
            });
        }
    });

    if (categories.length === 0) {
        userStatusChart.updateOptions({ xaxis: { categories: [] } });
        userStatusChart.updateSeries([], true);
        return;
    }

    userStatusChart.updateOptions({ xaxis: { categories: categories } });
    userStatusChart.updateSeries(statusSeries, true);
}

// Get Data for Header
function GetDataForHeader() {  
    const vals = $('#TypeSelectData').val();
    try {
        const datalist = document.getElementById('user_list').options;
        $.each(datalist, function (k, v) {
            if (v.value == vals) {
                const splitData = v.innerHTML.split(' - ');
                $('#info_ID').text(v.value);
                if (splitData[1].split(' | ')[1] == '') {
                    $('#info_CnName').text('.');
                } else {
                    $('#info_CnName').text(splitData[1].split(' | ')[1]);
                }

                $('#info_VnName').text(splitData[1].split(' | ')[0]);
                $('#info_Depart').text(splitData[0]);
            }
        });
    } catch (e) {

    }
}
// Ajax Function
function GetFilterData() {
    const vals = $('#TypeSelectData').val();
    let type = '';

    GetDataForHeader();

    switch (vals) {
        case '': {
            type = getCookie("UserCookies", "CardID");
            break;
        }
        case 'All': {
            type = 'All';
            $('#info_ID').text('All Work');
            $('#info_CnName').text('.');
            $('#info_VnName').text('.');
            $('#info_Depart').text('.');
            break;
        }
        case 'PE Work': {
            type = 'PE';
            $('#info_ID').text('PE Work');
            $('#info_CnName').text('.');
            $('#info_VnName').text('.');
            $('#info_Depart').text('PE');
            break;
        }
        case 'RE Work': {
            type = 'RE';
            $('#info_ID').text('RE Work');
            $('#info_CnName').text('.');
            $('#info_VnName').text('.');
            $('#info_Depart').text('RE');
            break;
        }
        case 'PE-RE Work': {
            type = 'PE-RE';
            $('#info_ID').text('PE - RE Work');
            $('#info_CnName').text('.');
            $('#info_VnName').text('.');
            $('#info_Depart').text('PE - RE');
            break;
        }
        default: {
            if (vals.charAt(0) === 'V' && vals.length === 8) {
                type = vals;
            }
            else {
                toastr["error"]('Wrong filter. Please double check!', 'CONNECT ERROR');
                return;
            }
        }
    }
    return type;
}
function GetDataDashboard(month, updatePieChart, updateColChart) {
    let type = GetFilterData();

    const listMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    month = listMonth.indexOf(month) + 1;

    const data = {
        id: type,
        month: month
    }

    $.ajax({
        type: "GET",
        url: "/Manager/Manager/GetDataDashboard",
        data: data,
        contentType: "application/json;charset=utf-8",
        success: async function (res) {
            dataTable.rows().remove('all');
            
            if (res.success) {
                $.each(res.ListWorks, function (key, value) {
                    dataTable.rows().add(MakeOneRow(value));
                });
                if (res.ListUser && !CheckUserList) {
                    await DrawUserListNormal(res.ListUser, 'user_list');
                    DrawUserList(res.ListUser, 'userRq_list');
                    DrawUserList(res.ListUser, 'userRc_list');
                    DrawModelList(res.ListModel, 'models_list');
                    DrawModelTableHead(res.ListModel, 'ModelSelect');

                    CheckUserList = true;
                }
                CreateChartData(res.ListWorks, updatePieChart, updateColChart);
                if (res.StatusTotals) {
                    UpdateStatusTotals(res.StatusTotals);
                }
                UpdateUserStatusChart(res.ListWorks, res.ListUser);
                GetDataForHeader();
            }
        },
        error: function (err) {
            toastr["error"]('Connect to server error. Please contact us!', 'CONNECT ERROR');
        }
    });
}
//$('#btn_filter').on('click', function (e) {
//    e.preventDefault();
//    GetDataDashboard(null, true, true);
//});


$('#btn_reset').on('click', function (e) {
    e.preventDefault();
    $('#TypeSelectData').val(ThisUser);
    GetDataDashboard(null, true, true);
});


// Event
{
    //  Show Edit Modal
    $(document).on("click", "[data-edit]", function (e) {
        e.preventDefault();
        this.blur();

        const role = getCookie("UserCookies", "Role");


        let id = $(this).data('edit');
        let index = $(this).parent().parent().index();
        let btn = document.getElementById('EditSaveBtn');
        btn.setAttribute('data-id', id);
        btn.setAttribute('data-index', index);

        $.ajax({
            type: "GET",
            url: "/Manager/Manager/GetWork/" + id,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    //Draw datalist
                    const data = res.data;

                    /* Check Permission*/
                    if (role == 3) {
                        const cookiesUser = getCookie("UserCookies", "CardID");
                        if (data.OwnerRequest != cookiesUser) {
                            let check = false;
                            $.each(data.OwnerReceive.split(','), function (k, v) {
                                if (v.trim() == cookiesUser) {
                                    check = true;
                                    return false;
                                }
                            });
                            if (!check) {
                                return;
                            }
                        }
                    }
                    /* End */

                    if (res.data.DueDate != null) {                      
                        $('#Edit2_Title').text(`EDIT WORK - ${data.ID}`)

                        $('#Edit2_StartDate').val(GetDateString(data.DateStart));
                        $('#Edit2_DueDate').val(GetDateString(data.DueDate));
                        $('#Edit2_OwnerRequest').val(data.OwnerRequest);
                        $('#Edit2_OwnerReceive').val(data.OwnerReceive);
                        $("#Edit2_CTF").val(data.CTF);
                        $("#Edit2_Model").val(data.Model);
                        $("#Edit2_Type").val(data.Type);
                        $("#Edit2_Status").val(data.Status);
                        $("#Edit2_Work").val(data.WorkDes);
                        $("#Edit2_Result").val(data.Detail);

                        $('#Edit2Modal').modal('show');
                    }
                    else {
                        resetModal('EditWorkModal');
                        const work = res.data;

                        document.getElementById('modalEditHead').innerHTML = 'EDIT WORK - ID: ' + work.ID;
                        document.getElementById('Edit_ID').value = work.ID;
                        document.getElementById('Edit_Date').value = GetDateString(work.DateStart);
                        let user1 = document.getElementById('Edit_UserReq');
                        let user2 = document.getElementById('Edit_UserRec');
                        user1.value = work.OwnerRequest;
                        user2.value = work.OwnerReceive;

                        if (work.OwnerRequest == getCookie('UserCookies', 'CardID') && getCookie('UserCookies', 'Role') != '1' && getCookie('UserCookies', 'Role') != '2') {
                            user1.disabled = true;
                        }
                        if (work.OwnerReceive == getCookie('UserCookies', 'CardID') && getCookie('UserCookies', 'Role') != '1' && getCookie('UserCookies', 'Role') != '2') {
                            user1.disabled = true;
                            user2.disabled = true;
                        }


                        $('#Edit_Status').val(work.Status);
                        $('#Edit_Type').val(work.Type);
                        $('#Edit_Detail').val(work.Detail);

                        { // Dynamic Input
                            let cardElm = document.getElementById('cardEdit');
                            let InMax = 0;
                            $.each(JSON.parse(work.WorkDes), function (key, value) {
                                let stringHtmlInputAdd =
                                    '<div class="row mb-3" data-EditModalCard="' + key + '">' +
                                    '<div class="col-11" >' +
                                    '<input type="text" class="form-control" data-InputEdit="' + key + '" value="' + value + '"></div>' +
                                    '<div class="col-1">';
                                stringHtmlInputAdd += '<button type = "button" class="btn btn-outline-danger" onclick = "DynamicEditRemove(' + key + ')">' +
                                    '<i class="bi bi-trash"></i>';
                                stringHtmlInputAdd += '</button></div></div>';
                                cardElm.innerHTML += stringHtmlInputAdd;
                                if (InMax < key) InMax = key;
                            });
                            InMax++;
                            const stringHtmlInputAdd =
                                '<div class="row mb-3" data-EditModalCard="' + InMax + '">' +
                                '<div class="col-11" >' +
                                '<input type="text" class="form-control" data-InputEdit="' + InMax + '" placeholder="Enter the work here...">' +
                                '</div>' +
                                '<div class="col-1">' +
                                '<button type = "button" class="btn btn-outline-success" onclick = "DynamicEditWork()" >' +
                                '<i class="bi bi-plus-lg"></i>' +
                                '</button>' +
                                '</div>' +
                                '</div>';
                            cardElm.insertAdjacentHTML('beforeend', stringHtmlInputAdd);
                        }

                        $('#EditWorkModal').modal('show');
                    }
                }
                else {
                    toastr["error"](res.error, 'SERVER ALRET');
                }
            },
            error: function () {
                toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            }
        });
    });
    function EditModal_Save() {
        const btn = document.getElementById('EditSaveBtn');
        let id = btn.getAttribute('data-id');
        let index = btn.getAttribute('data-index');

        //Control data
        let data;
        if ($('#Edit2_Title').text() == 'EDIT WORK - ' + id) {
            data = {
                ID: id,

                DateStart: $('#Edit2_StartDate').val(),
                DueDate: $('#Edit2_DueDate').val(),
                OwnerRequest: $('#Edit2_OwnerRequest').val(),
                OwnerReceive: $('#Edit2_OwnerReceive').val(),

                CTF: $('#Edit2_CTF').val(),
                Model: $('#Edit2_Model').val(),
                Type: $('#Edit2_Type').val(),
                Status: $('#Edit2_Status').val(),

                WorkDes: $('#Edit2_Work').val(),
                Detail: $('#Edit2_Result').val()
            }

        }
        else {
            data = {
                ID: $('#Edit_ID').val(),
                DateStart: $('#Edit_Date').val(),
                Type: $('#Edit_Type').val(),
                OwnerRequest: $('#Edit_UserReq').val(),
                OwnerReceive: $('#Edit_UserRec').val(),
                Status: $('#Edit_Status').val(),
                Detail: $('#Edit_Detail').val()
            }
            const workInput = [...document.querySelectorAll(`[data-InputEdit]`),];
            const arrLength = workInput.length;
            if (arrLength > 1) {
                data.WorkDes = '{';
                for (let i = 0; i < arrLength - 1; i++) {
                    if (i < arrLength - 2)
                        data.WorkDes += '"' + (i + 1) + '":"' + workInput[i].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '",';
                    else
                        data.WorkDes += '"' + (i + 1) + '":"' + workInput[i].value.replace(/"/g, "'").replace(/\\'/g, "\'") + '"';
                }
                data.WorkDes += '}';
            }
            else {
                toastr["warning"]('Please click (+) button after enter work!', 'Work Null');
                return;
            }
        }

        const sendData = {
            work: data,
            changeTime: GetDateToday().replace('T', ' '),
            userChange: getCookie('UserCookies', 'CardID'),
        }
        //Send to server
        $.ajax({
            url: "/Manager/Manager/EditWork",
            data: JSON.stringify(sendData),
            type: "POST",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    let dataRes = res.dataRow;

                    dataTable.rows().updateRow(index, MakeOneRow(dataRes));
                    $('#Edit2Modal').modal('hide');
                    $('#EditWorkModal').modal('hide');

                    toastr["success"]('Update work success', dataRes.ID + ' | ' + GetDateString(dataRes.DateStart).replace('T', ' '));
                }
                else {
                    toastr["error"](res.error, 'SERVER ALRET');
                }
            },
            error: function () {
                toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            }
        });

    }

    //  Show Detele Modal
    $(document).on("click", "[data-delete]", function (e) {
        e.preventDefault();
        this.blur();
        const role = getCookie("UserCookies", "Role");

        let id = $(this).data('delete');
        let index = $(this).parent().parent().index();
        let btn = document.getElementById('deleteBtn');

        btn.setAttribute('data-id', id);
        btn.setAttribute('data-index', index);

        $.ajax({
            type: "GET",
            url: "/Manager/Manager/GetWork/" + id,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    const work = res.data;

                    /* Check Permission*/
                    if (role == 3) {
                        const cookiesUser = getCookie("UserCookies", "CardID");
                        if (work.OwnerRequest != cookiesUser) {
                            let check = false;
                            $.each(work.OwnerReceive.split(','), function (k, v) {
                                if (v.trim() == cookiesUser) {
                                    check = true;
                                    return false;
                                }
                            });
                            if (!check) {
                                return;
                            }
                        }
                    }
                    /* End */

                    $('#detail_ctf').text(work.CTF);
                    $('#detail_model').text(work.Model);
                    $('#detail_type').text(work.Type);
                    $('#detail_rq').text(work.OwnerRequest);
                    let textRc = '';
                    $('#detail_rc').text('');
                    $.each(work.OwnerReceive.split(','), function (k, v) {
                        textRc += v + '<br>';
                    });
                    $('#detail_rc').append(textRc);

                    //Show Modal
                    $('#DeleteWorkModal').modal('show');
                }
                else {
                    toastr["error"](res.error, 'SERVER ALRET');
                }
            },
            error: function () {
                toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            }
        });
    });
    function DeteleWork() {
        const btn = document.getElementById('deleteBtn');
        let id = btn.getAttribute('data-id');
        let index = btn.getAttribute('data-index');

        $.ajax({
            type: "POST",
            url: "/Manager/Manager/DeleteWork/" + id,
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    toastr["success"]('Delete work success!', 'SUCCESS');
                    dataTable.rows().remove(index);
                    $('#DeleteWorkModal').modal('hide');
                    return;
                }
                else {
                    toastr["error"](res.error, 'SERVER ALRET');
                }
            },
            error: function () {
                toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            }
        });

    }

    //  Show Detail Modal
    $(document).on("click", "[data-detail]", function (e) {
        e.preventDefault;
        this.blur();
        const role = getCookie("UserCookies", "Role");

        let id = $(this).data('detail');

        $.ajax({
            type: "GET",
            url: "/Manager/Manager/GetWork/" + id,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    const work = res.data;
                                       
                    const userReq = JSON.parse(res.userReq);
                    const userRec = JSON.parse(res.userRec);

                    $('#details_ctf').text(work.CTF);
                    $('#details_model').text(work.Model);
                    $('#details_type').text(work.Type);
                    let ptext;
                    switch (work.Status) {
                        case 'On-going': {
                            ptext = `<p class="card-text badge rounded-pill bg-warning">On-going</p>`;
                            break;
                        }
                        case 'Done': {
                            ptext = `<p class="card-text badge rounded-pill bg-success">Done</p>`;
                            break;
                        }
                        case 'Open': {
                            ptext = `<p class="card-text badge rounded-pill bg-danger">Open</p>`;
                            break;
                        }
                        case 'Close': {
                            ptext = `<p class="card-text badge rounded-pill bg-secondary">Close</p>`;
                            break;
                        }
                    }
                    $('#details_status').html(ptext);

                    //Card Requester and Receiver
                    $('#details_cardid_rq').text(userReq[0].CardID);
                    $('#details_name_rq').text(userReq[0].CnName + ' | ' + userReq[0].VnName);
                    $('#details_depart_rq').text(userReq[0].Department);

                    $('#ownerRc_Card').html('');
                    $.each(userRec, function (k, v) {
                        let ownerRc_card = `<div class="fs-5" id="details_owner_rc">
                            <!---->
                            <div class="row" id="details_cardHead">
                                <p class="card-text">Owner receive ${k + 1}</p>
                            </div>
                            <!---->
                            <div class="row">
                                <div class="col-3">
                                    <p class="card-text">Card ID</p>
                                </div>
                                <div class="col-8">
                                    <p class="card-text" id="details_cardid_rc">${v.CardID}</p>
                                </div>
                            </div>
                            <!---->
                            <div class="row">
                                <div class="col-3">
                                    <p class="card-text">Name</p>
                                </div>
                                <div class="col-8">
                                    <p class="card-text" id="details_name_rc">${v.CnName} | ${v.VnName}</p>
                                </div>
                            </div>
                            <!---->
                            <div class="row">
                                <div class="col-3">
                                    <p class="card-text">Department</p>
                                </div>
                                <div class="col-8">
                                    <p class="card-text" id="details_depart_rc">${v.Department}</p>
                                </div>
                            </div>
                        </div>`;
                        $('#ownerRc_Card').append(ownerRc_card);
                    });

                    // Card Time
                    const p_time = `<label class="fw-bold text-success">${GetDateString(work.DateStart, 'DateTime')} </label> 
                                              <label> - </label>
                                            <label class="fw-bold text-danger"> ${GetDateString(work.DueDate, 'DateTime')}</label>`;
                    $('#details_date').html(p_time);

                    //Card Work     
                    let workHtmlText = '';
                    try {
                        $.each(JSON.parse(work.WorkDes), function (key, value) {
                            workHtmlText += `<p>${key}: ${value}`;
                        });
                    }
                    catch {
                        workHtmlText += work.WorkDes;
                    }
                    $('#details_work').html(workHtmlText);

                    //Card Work     
                    $('#details_result').html(work.Detail);

                    //Card History
                    let HistoryElm = document.getElementById('details_history');

                    HistoryElm.innerHTML = '';

                    /* Check Permission*/
                    let showHistory = true;
                    if (role == 3) {
                        if (work.OwnerRequest != getCookie("UserCookies", "CardID")) {
                            $.each(work.OwnerReceive.split(','), function (k, v) {
                                if (v.trim() == getCookie("UserCookies", "CardID")) {
                                    showHistory = true;
                                    return false;
                                } else {
                                    showHistory = false;
                                }
                            });
                        }
                    }
                    /* End */
                    if (showHistory) {
                        if (work.HistoryLog != null) {
                            let log = Object.entries(JSON.parse(work.HistoryLog)).reverse();
                            $.each(log, function (key, value) {
                                if (value[1].length > 0) {
                                    let html = '';
                                    html += '<div data-vtdate="<b>' + value[0] + '</b>">';
                                    $.each(value[1], function (k, v) {
                                        html += '<h5>Change: <b>' + v.Action + '</b></h5>';
                                        html += `<a href="/Dashboard/' + v.User + '">${v.User}</a>`;
                                        html += '<div class="row">'
                                        html += '<div class="col-3"><p>Before:</p></div>'
                                        html += '<div class="col-9"><p>' + clearJson(v.Old) + '</p></div></div>'
                                        html += '<div class="row">'
                                        html += '<div class="col-3"><b>After:</b></div>'
                                        html += '<div class="col-9"><p>' + clearJson(v.New) + '</p></div></div>'
                                    });
                                    html += '</div>';
                                    HistoryElm.innerHTML += html;
                                }
                            });
                            $('#details_history').verticalTimeline({
                                startLeft: false,
                                alternate: true,
                                animate: "Slide",
                                arrows: false
                            });
                        }
                    }
                    //Show Modal
                    $('#DetailWorkModal').modal('show');
                }
                else {
                    toastr["error"](res.error, 'SERVER ALRET');
                }
            },
            error: function () {
                toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
            }
        });
    });
}
