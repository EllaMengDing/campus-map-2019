/* Add content on sidebar */
function loadContent(tab) {
    if (tab === "hamburger") {
        $('#sidebar').append('<div id="sidebar-' + tab + '" class="sidebar-content">' + tab + '</div>');
    } else {
        $('#sidebar').append('<div id="sidebar-' + tab + '" class="sidebar-content">' + tab + '</div>');
    }
}

function showContent(tab) {
    $('.sidebar-content').hide();
    if ($('#sidebar').find('#sidebar-' + tab).html() == undefined) loadContent(tab);
    else $('#sidebar-' + tab).show();
}
/* Toggle sidebar */
var currentTab = 'layers';
var tabToggle = true;
$(".nav-sb-menu[data-label='layers']").css('color', 'white');
$(".nav-sb-menu").on('click', function() {
    $(".nav-sb-menu").css('color', 'black');
    if (currentTab != $(this).data('label') || !tabToggle) {
        $(".nav-sb-menu[data-label='" + $(this).data('label') + "']").css('color', 'white');
        showContent($(this).data('label'));
    }
    if (currentTab == $(this).data('label') || !tabToggle) {
        $(".sidebar").animate({ width: "toggle" });
        tabToggle = !tabToggle;
    }
    currentTab = $(this).data('label');
});

/* toggle student-info in sidebar */
$("#sidebar").on('click', "#toggle-student-info",function() {
    $(".student-info").toggle();
});

/* toggle share in sidebar */
$("#sidebar").on('click', "#toggle-share", function() {
    $(".share").toggle();
});

/* toggle about in sidebar */
$("#sidebar").on('click', "#toggle-about", function() {
    $(".about").toggle();
});

/* toggle help in sidebar */
$("#sidebar").on('click', "#toggle-help", function() {
    $(".help").toggle();
});

/* toggle version in sidebar */
$("#sidebar").on('click', "#toggle-version", function() {
    $(".version").toggle();
});

