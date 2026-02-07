/*********************************************/
/*              READY FUNCTION               */
/*********************************************/
var dataTable;
$(function () {
    // open tooltip    
    ToastInit()
    // open and config datatable
    try {
        DatatableInit();
    } catch {    
       
    }  
    
});
function DatatableInit() {
    var scrollHeight = document.querySelector('#sidebar').offsetHeight - 230 + 'px';
    var myTable = document.querySelector('#MyTable');
    dataTable = new simpleDatatables.DataTable(myTable, {
        scrollY: scrollHeight,
        scrollX: true,
        scrollCollapse: true,
        paging: false,
        sortable: false,
        fixedColumns: false,
    });
    $('[data-toggle="tooltip"]').tooltip();
    document.getElementById("userHeadAvata").src = generateAvatar(getName(getCookie("UserCookies", "VnName")), "white", random_bg_color());
}
function ToastInit() {
    // toast config
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
}

function ChangePass() {
    const data = {
        id: getCookie("UserCookies", "CardID"),
        oldPass: $('#old_Pass').val(),
        newPass: $('#new_Pass1').val(),
        confirm: $('#new_Pass2').val()
    }
    $.ajax({
        url: "/Login/ChangePass/",
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            switch (res.status) {
                case 'ok': {
                    toastr["success"]('Change password success!');
                    $('#ChangePassModal').modal('hide');
                    return;
                }
                case 'fail': {
                    toastr["error"]('Cannot find Card ID!');
                    return;
                }
                case 'confirm fail': {
                    toastr["warning"]('New password and reenter password not same!');
                    return;
                }
                case 'password fail': {
                    toastr["warning"]('Wrong Password!');
                    return;
                }
                default: {
                    toastr["error"]('Please contact to fix it!', 'Send Fail');
                    return;
                }
            };
        },
        error: function (err) {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
        }
    });

}
function ShowChangePassModal() {
    $('#ChangePassModal').modal('show');
}

function temp() {
    $.ajax({
        url: "/MCU/Manager/DownloadType",
        type: "GET",
        data: { Id: $(elm).data('id'), Type: $(elm).data('type') },
        contentType: "application/json;charset=utf-8",
        xhrFields: { responseType: 'blob' },
        success: function (data) {
            const blob = new Blob([data], { type: "application/octet-stream" });
            const isIE = false || !!document.documentMode;
            if (isIE) {
                window.navigator.msSaveBlob(blob, $(elm).text().trim());
            } else {
                const url = window.URL || window.webkitURL;
                link = url.createObjectURL(blob);
                const a = document.createElement("a");
                a.setAttribute("download", $(elm).text().trim());
                a.setAttribute("href", link);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        },
        error: function () {
            toastr["error"]('Connect to server error! Please double check or contact us', 'SERVER CONNECT ERROR');
        }
    });
}
function ExcelExport() {

    let _ids = [];
    $.each($('#table_Body').find('[data-id]'), function (k, v) {
        const id = $(v).data('id');
        _ids.push(id)
    });
    const data = {
        _ids: _ids,
        _date: GetDateExcelExport(),
        _owner: getCookie("UserCookies", "CardID")
    }
    $.ajax({
        url: `/Handover/Works/ExportExcel`,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (response, status, xhr) {
            const blob = new Blob([response], { type: xhr.getResponseHeader('content-type') });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Work_${GetDateExcelExport()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        error: function () {
            toastr["error"]('Connect to server error! Please double check or contact', 'CONNECT ERROR');
        }
    });

}

function GetDateExcelExport() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hh = today.getHours();
    let MM = today.getMinutes();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + '-' + mm + '-' + dd;
}


$('#btn_new_update').on('click', function (e) {
    e.preventDefault();
    $('#modal_new_update').modal('show');
});