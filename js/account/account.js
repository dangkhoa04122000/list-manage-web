function viewAccountPage() {
    $(".main").load("./account/accountPage.html", function() {
        setupSearchEvent();
        setupFilter();
        buildAccountTable();
    });
}

function buildAccountTable() {
    $('#account-table tbody').empty();
    getListAccounts();
}

var accounts = [];

// paging
var currentPage = 1;
var size = 5;

// sorting
var sortField = "id";
var isAsc = false;

// get List
function getListAccounts() {
    var url = "http://localhost:8080/api/v1/accounts";

    // paging
    url += '?page=' + currentPage + '&size=' + size;

    // sorting
    url += "&sort=" + sortField + "," + (isAsc ? "asc" : "desc");

    // search
    if(document.getElementById("search-account-input") != null){
        var search = document.getElementById("search-account-input").value;
        if (search) {
            url += "&search=" + search;
        }
    }
   

    // filter
    var role = document.getElementById("filter-role-select").value;
    if (role && role != "All Roles") {
        url += "&role=" + role;
    }

    var departmentName = $("#filter-department-select option:selected").text();
    if (departmentName && departmentName != "All Departments") {
        url += "&departmentName=" + departmentName;
    }

    // call API from server
    $.ajax({
        url: url,
        type: 'GET',
        contentType: "application/json",
        dataType: 'json', // datatype return
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("quanganh" + ":" + "123456"));
        },
        success: function(data, textStatus, xhr) {
            // success
            accounts = data.content;
            fillAccountToTable();
            fillAccountPaging(data.numberOfElements, data.totalPages);
            fillAccountSorting();
        },
        error(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });

}

function fillAccountToTable() {
    accounts.forEach(function(item, index) {
        $('#account-table tbody').append(
            '<tr>' +
            '<td> ' +
            '<span class="account-checkbox"> ' +
            '<input id="checkbox-' + index + '" type="checkbox" onClick="onChangeAccountCheckboxItem()"/>' +
            '<label></label>' +
            '</span>' +
            '</td>' +
            '<td>' + item.username + '</td>' +
            '<td>' + item.fullName + '</td>' +
            '<td>' + item.role + '</td>' +
            '<td>' + item.departmentName + '</td>' +

            '<td class="td-actions"> ' +
            '<a href="#" data-toggle="tooltip" title="Edit" onclick="showUpdateAccountModal(' + item.id + ')"><i class="fa-solid fa-pencil"></i></a>' +
            '<a href="#" data-toggle="tooltip" title="Devare" onclick="showDeleteSingleAccountModal(' + item.id + ', \'' + item.fullName + '\')"><i class="fa-regular fa-trash-can"></i></a>' +
            '</td>' +
            '</tr>'
        );
    });
}

// paging
function fillAccountPaging(currentSize, totalPages) {
    // prev
    if (currentPage > 1) {
        document.getElementById("account-previousPage-btn").disabled = false;
    } else {
        // document.getElementById("account-previousPage-btn").disabled = true;
    }

    // next
    if (currentPage < totalPages) {
        document.getElementById("account-nextPage-btn").disabled = false;
    } else {
        document.getElementById("account-nextPage-btn").disabled = true;
    }

    // text
    document.getElementById("account-page-info").innerHTML = currentSize + (currentSize > 1 ? " records " : " record ") + currentPage + " of " + totalPages;
}

function prevAccountPage() {
    changeAccountPage(currentPage - 1);
}

function nextAccountPage() {
    changeAccountPage(currentPage + 1);
}

function changeAccountPage(page) {
    currentPage = page;
    buildAccountTable();
}

// Sorting
function fillAccountSorting() {
    var sortTypeClazz = isAsc ? "fa-sort-up" : "fa-sort-down";
    var defaultSortType = "fa-sort";

    switch (sortField) {
        case 'username':
            changeIconSort("username-sort", sortTypeClazz);
            changeIconSort("fullname-sort", defaultSortType);
            changeIconSort("departmentName-sort", defaultSortType);
            break;
        case 'fullName':
            changeIconSort("username-sort", defaultSortType);
            changeIconSort("fullname-sort", sortTypeClazz);
            changeIconSort("departmentName-sort", defaultSortType);
            break;
        case 'departmentName':
            changeIconSort("username-sort", defaultSortType);
            changeIconSort("fullname-sort", defaultSortType);
            changeIconSort("departmentName-sort", sortTypeClazz);
            break;

            // sort by id
        default:
            changeIconSort("username-sort", defaultSortType);
            changeIconSort("fullname-sort", defaultSortType);
            changeIconSort("departmentName-sort", defaultSortType);
            break;
    }
}

function changeIconSort(id, sortTypeClazz) {
    document.getElementById(id).classList.remove("fa-sort", "fa-sort-up", "fa-sort-down");
    document.getElementById(id).classList.add(sortTypeClazz);
}

function changeAccountSort(field) {
    if (field == sortField) {
        isAsc = !isAsc;
    } else {
        sortField = field;
        isAsc = true;
    }
    buildAccountTable();
}

// search

function setupSearchEvent() {
    $("#search-account-input").on("keyup", function(event) {
        // enter key code = 13
        if (event.keyCode === 13) {
            buildAccountTable();
        }
    });
}

// filter
function filterAccount() {
    buildAccountTable();
}

function setupFilter() {
    setupRole();
    setupDepartmentFilter();
}

function setupRole() {
    $("#filter-role-select").select2({
        placeholder: "Select a role"
    });
}

function setupDepartmentFilter() {
    // change selectboxes to selectize mode to be searchable
    // setup call API
    $("#filter-department-select").select2({
        placeholder: "Select a department",
        ajax: {
            url: "http://localhost:8080/api/v1/accounts/departments",
            dataType: 'json',
            type: "GET",
            data: function(params) {
                var query = {
                    // paging
                    page: 1,
                    size: 5,
                    // sorting
                    sort: "id,asc",
                    // search
                    search: params.term
                }

                // Query parameters will be ?page=1&size=5&sort=id,asc&search=[term]
                return query;
            },
            processResults: function(data) {
                var defaultValue = {
                    "id": 0,
                    "name": "All Departments"
                };

                var departments = data.content;
                departments.splice(0, 0, defaultValue);

                return {
                    results: $.map(departments, function(item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            }
        }
    });
}

// Refresh Table
function refreshAccountTable() {
    // refresh paging
    currentPage = 1;
    size = 5;

    // refresh sorting
    sortField = "id";
    isAsc = false;

    // refresh search
    document.getElementById("search-account-input").value = "";

    // refresh filter
    $("#filter-department-select").empty();
    $('#filter-role-select').val('').trigger('change');

    // Get API
    buildAccountTable();
}

function openAccountModal() {
    $('#addAndUpdateAcccountModal').modal('show');
}

function hideAccountModal() {
    $('#addAndUpdateAcccountModal').modal('hide');
}

// open create modal 
function openAddAccountModal() {
    openAccountModal();
    resetAddAccountForm();
}

function resetAddAccountForm() {
    // set title
    document.getElementById("addAndUpdateAccount-modal-title").innerHTML = "Create New Account";

    // Reset all input value
    document.getElementById("modal-username").value = "";
    document.getElementById("modal-first-name").value = "";
    document.getElementById("modal-last-name").value = "";
    document.getElementById("modal-role-select").value = "PickARole";
    document.getElementById("modal-department-select").value = "PickADepartment";

    // role
    setupRoleSelectionInForm();

    // department
    setupDepartmentSelectionInForm();

    // Reset all error message
    resetAccountModalErrMessage();
}

function setupRoleSelectionInForm() {
    $("#modal-role-select").select2({
        placeholder: "Select a role"
    });
}

function setupDepartmentSelectionInForm() {
    // change selectboxes to selectize mode to be searchable
    // setup call API
    $("#modal-department-select").select2({
        placeholder: "Select a department",
        ajax: {
            url: "http://localhost:8080/api/v1/accounts/departments",
            dataType: 'json',
            type: "GET",
            data: function(params) {
                var query = {
                    // paging
                    page: 1,
                    size: 5,
                    // sorting
                    sort: "id,asc",
                    // search
                    search: params.term
                }

                // Query parameters will be ?page=1&size=5&sort=id,asc&search=[term]
                return query;
            },
            processResults: function(data) {
                return {
                    results: $.map(data.content, function(item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            }
        }
    });
}

function resetAccountModalErrMessage() {
    hideFieldErrorMessage("modal-input-errMess-username", "modal-username");
    hideFieldErrorMessage("modal-input-errMess-name", "modal-first-name");
    hideFieldErrorMessage("modal-input-errMess-name", "modal-last-name");
    hideFieldErrorMessage("modal-input-errMess-role", "modal-role-select");
    hideFieldErrorMessage("modal-input-errMess-department", "modal-department-select");
}

// save
function saveAccount() {
    var id = document.getElementById("account-id").value;
    if (!id) {
        addAccount();
    } else {
        updateAccount();
    }
}

var error_message_username = "Username must be from 6 to 50 characters!";
var error_message_username_exists = "Username already exists!";
var error_message_name = "First name and last name must be from 6 to 50 characters, and contain no numbers or special characters!";
var error_message_role = "You must choose role!";
var error_message_department = "You must choose department!";

function addAccount() {
    var username = document.getElementById("modal-username").value;
    var firstName = document.getElementById("modal-first-name").value;
    var lastName = document.getElementById("modal-last-name").value;
    var role = document.getElementById("modal-role-select").value;
    var departmentId = $('#modal-department').value;

    // validate
    var validUsername = isValidUsername(username);
    var validfirstname = isValidfirstname(firstName);
    var validlastname = isValidlastname(lastName);
    var validRole = isValidRole(role);
    var validDepartment = isValidDepartment(departmentId);

    // format
    if (!validUsername || !validfirstname || !validlastname || !validRole  ) {
        return;
    }

    // check username unique
    $.get("http://localhost:8080/api/v1/accounts/username/" + username + "/exists", function(data, status) {

        // error
        if (status == "error") {
            // TODO
            alert("Error when loading data");
            return;
        }

        if (data) {
            // show error message
            showFieldErrorMessage("modal-input-errMess-username", "modal-username", error_message_username_exists);
            return;
        } else {
            createAccountViaAPI(username, firstName, lastName, role);
        }
    });
}

function createAccountViaAPI(username, firstName, lastName, role) {
    // call api create department
    var newAccount = {
        "username": username,
        "firstName": firstName,
        "lastName": lastName,
        "role": role,
        "departmentId": departmentId
    }

    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts',
        type: 'POST',
        data: JSON.stringify(newAccount), // body
        contentType: "application/json", // type of body (json, xml, text)
        success: function(data, textStatus, xhr) {
            // success
            hideAccountModal();
            showSuccessSnackBar("Success! New account created!");
            buildAccountTable();
        },
        error(jqXHR, textStatus, errorThrown) {
            alert("Error when loading data");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function isValidUsername(username) {

    if (!username) {
        // show error message
        showFieldErrorMessage("modal-input-errMess-username", "modal-username", error_message_username);
        return false;
    }

    // validate format
    var regex = new RegExp('^(?=.*[a-z])[a-zA-Z0-9_.-]{6,50}$');
    if (!regex.test(username)) {
        showFieldErrorMessage("modal-input-errMess-username", "modal-username", error_message_username);
        return false;
    };

    hideFieldErrorMessage("modal-input-errMess-username", "modal-username");
    return true;
}

function isValidfirstname(name) {

    if (!name) {
        // show error message
        showFieldErrorMessage("modal-input-errMess-name", "modal-first-name", error_message_name);
        return false;
    }

    // validate format
    var regex = new RegExp('^[a-zA-Z\\s]+$');
    if (!regex.test(name)) {
        showFieldErrorMessage("modal-input-errMess-name", "modal-first-name", error_message_name);
        return false;
    };

    hideFieldErrorMessage("modal-input-errMess-name", "modal-first-name");
    return true;
}

function isValidlastname(name) {

    if (!name) {
        // show error message
        showFieldErrorMessage("modal-input-errMess-name", "modal-last-name", error_message_name);
        return false;
    }

    // validate format
    var regex = new RegExp('^[a-zA-Z\\s]+$');
    if (!regex.test(name)) {
        showFieldErrorMessage("modal-input-errMess-name", "modal-last-name", error_message_name);
        return false;
    };

    hideFieldErrorMessage("modal-input-errMess-name", "modal-last-name");
    return true;
}

function isValidRole(role) {
    if (!role) {
        // show error message
        showFieldErrorMessage("modal-input-errMess-role", "modal-role-select", error_message_role);
        return false;
    }

    hideFieldErrorMessage("modal-input-errMess-role", "modal-role-select");
    return true;
}

function isValidDepartment(department) {
    if (!department) {
        console.log("show message");
        // show error message
        showFieldErrorMessage("modal-input-errMess-department", "modal-department-select", error_message_department);
        return false;
    }

    hideFieldErrorMessage("modal-input-errMess-department", "modal-department-select");
    return true;
}

function showFieldErrorMessage(messageId, inputId, message) {
    document.getElementById(messageId).innerHTML = message;
    document.getElementById(messageId).style.display = "block";
    document.getElementById(inputId).style.border = "1px solid red";
}

function hideFieldErrorMessage(messageId, inputId) {
    document.getElementById(messageId).style.display = "none";
    document.getElementById(inputId).style.border = "1px solid #ccc";
}

// delete single account
function showDeleteSingleAccountModal(accountId, fullName) {
    $('#deleteSingleAccountModal').modal('show');
    document.getElementById('delete-single-account-confirm-mess').innerHTML = 'This action can not be undone. Delete <span style="color:red;">' + fullName + '</span>?';
    document.getElementById('delete-single-account-btn').onclick = function() { deleteSingleAccount(accountId) };
}

function deleteSingleAccount(accountId) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts/' + accountId,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("quanganh" + ":" + "123456"));
        },
        type: 'DELETE',
        success: function(result) {
            // error
            if (result == undefined || result == null) {
                alert("Error when loading data");
                return;
            }

            // success
            showSuccessSnackBar("Success! Account deleted.");
            $('#deleteSingleAccountModal').modal('hide');
            buildAccountTable();
        }
    });
}

// delete multiple account
function onChangeAccountCheckboxAll() {
    var i = 0;
    while (true) {
        var checkboxItem = document.getElementById("checkbox-" + i);
        if (checkboxItem !== undefined && checkboxItem !== null) {
            checkboxItem.checked = document.getElementById("checkbox-all").checked
                if (document.getElementById("checkbox-all").checked) {
                    checkboxItem.checked = true;
                } else {
                    checkboxItem.checked = false;
                }
            i++;
        } else {
            break;
        }
    }
}

function onChangeAccountCheckboxItem() {
    var i = 0;
    while (true) {
        var checkboxItem = document.getElementById("checkbox-" + i);
        if (checkboxItem !== undefined && checkboxItem !== null) {
            if (!checkboxItem.checked) {
                document.getElementById("checkbox-all").checked = false;
                return;
            }
            i++;
        } else {
            break;
        }
    }
    document.getElementById("checkbox-all").checked = true;
}

function showDeleteMultipleAccountsModal() {
    $('#deleteMultipleAccountsModal').modal('show');

    // get checked
    var ids = [];
    var fullnames = [];
    var i = 0;
    while (true) {
        var checkboxItem = document.getElementById("checkbox-" + i);
        if (checkboxItem !== undefined && checkboxItem !== null) {
            if (checkboxItem.checked) {
                ids.push(accounts[i].id);
                fullnames.push(accounts[i].fullName);
            }
            i++;
        } else {
            break;
        }
    }

    if (!ids || ids.length == 0) {
        document.getElementById('delete-accounts-confirm-mess').innerHTML = 'Choose at least one account to delete!';
        document.getElementById('delete-multiple-accounts-btn').style.display = 'none';
    } else {
        document.getElementById('delete-accounts-confirm-mess').innerHTML = 'This action can not be undone. Delete <span id="user-fullName-delete-message"></span>?';
        document.getElementById('user-fullName-delete-message').innerHTML += '<span style="color: red;">' + fullnames.join(", ") + '</span> (<span style="color: red;">' + fullnames.length + '</span> ' + (fullnames.length == 1 ? 'account' : 'accounts') + ')';
        document.getElementById('delete-multiple-accounts-btn').style.display = 'inline-block';
        document.getElementById('delete-multiple-accounts-btn').onclick = function() { deleteMultipleAccounts(ids) };
    }
}

function deleteMultipleAccounts(accountIds) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts?ids=' + accountIds.toString(),
        type: 'DELETE',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("quanganh" + ":" + "123456"));
        },
        success: function(result) {
            // error
            if (result == undefined || result == null) {
                alert("Error when loading data");
                return;
            }

            // success
            showSuccessSnackBar("Success! Account deleted.");
            $('#deleteMultipleAccountsModal').modal('hide');
            buildAccountTable();
        }
    });
}