/* eslint-disable no-undef */
$(function() {



    $('.send-filtr').on('click', function() {
        var categoryId = $('#select_category').val();
        $(location).attr('href', '/categories/'+ categoryId);
    });

    // eslint-disable-next-line
    // publish
    $('.publish-button-category').on('click', function(e) {
      e.preventDefault();
  
      var data = {
        name: $('#category-name').val(),
      };
  
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/category/add'
      }).done(function(data) {
        $(location).attr('href', '/category/add');
        console.log(data);
        if (!data.ok) {
          // $('.register h2').after('<p class="error">' + data.error + '</p>');
          // if (data.fields) {
          //   data.fields.forEach(function(item) {
          //     $('input[name=' + item + ']').addClass('error');
          //   });
          // }
          $(location).attr('href', '/category/add');
        } else {
          // $('.register h2').after('<p class="success">Отлично!</p>');
          $(location).attr('href', '/category/add');
        }
      });
    });
  });