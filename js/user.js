'use strict';

(function(){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  var SENSOR_LIST_MARKUP =
    '<a href="sensor.html?id=${_id}" class="collection-item">${name}</a>';
  var PROJECT_LIST_MARKUP =
    '<div class="col s6 m3"><a href="project.html?id=${id}">' +
    '<div class="card"><div class="card-image"></div></div>' +
    '<p id="project-names" class="center-align">${name}</p></a></div>';
  var userId;

  function init() {
    userId = $.url().param('id');
    $('#add-device').attr('href', 'sensor-setup.html?id=' + userId);
  }

  function renderSensorList(sensors) {
    $.tmpl(SENSOR_LIST_MARKUP, sensors).appendTo('#sensor-list');
  }

  function renderProjectList(projects) {
    $.tmpl(PROJECT_LIST_MARKUP, projects).appendTo('#user-projects');
  }

  function fetchData() {
    // Fetch user detail
    $.ajax({
      url: API_URL + 'users/' + userId,
      dataType: 'jsonp'
    })
    .done(function(user) {
      $('#user-card .user-id').text(user.userId);
      $('#user-card .user-name').text(user.name);
      $('#user-card .user-info').text(user.publicEmail);
      $('#user-card img').attr('src', user.picture);
    })
    .fail(function(error) {
      console.error(error);
    });

    // Fetch sensors for specific user
    $.ajax({
      url: API_URL + 'users/' + userId + '/sensors',
      dataType: 'jsonp'
    })
    .done(renderSensorList)
    .fail(function(error) {
      console.error(error);
    });

    // Fetch projects for specific user
    $.ajax({
      url: API_URL + 'users/' + userId + '/projects',
      dataType: 'jsonp'
    })
    .done(renderProjectList)
    .fail(function(error) {
      console.error(error);
    });
  }

  init();
  fetchData();

})(window);
