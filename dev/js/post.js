/* eslint-disable no-undef */
$(function() {
  // remove errors
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  }

  // clear
  $('.post-form input, #post-body').on('focus', function() {
    removeErrors();
  });

  // publish
  $('.publish-button, .save-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var checkboxes =$('.checkbox');
    var checkboxesChecked = [];
    for (var index = 0; index < checkboxes.length; index++) {
      if (checkboxes[index].checked) {
         checkboxesChecked.push(checkboxes[index].value); // положим в массив выбранный
         //alert(checkboxes[index].value); // делайте что нужно - это для наглядности
      }
   }


    var isDraft =
      $(this)
        .attr('class')
        .split(' ')[0] === 'save-button';

    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val(),
      isDraft: isDraft,
      postId: $('#post-id').val(),
      categoryList: checkboxesChecked
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {
      console.log(data);
      if (!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        // $('.register h2').after('<p class="success">Отлично!</p>');
        // $(location).attr('href', '/');
        if (isDraft) {
          $(location).attr('href', '/post/edit/' + data.post.id);
        } else {
          $(location).attr('href', '/posts/' + data.post.url);
        }
      }
    });
  });

  // upload
  $('#file').on('change', function() {
    // e.preventDefault();

    var formData = new FormData();
    formData.append('postId', $('#post-id').val());
    formData.append('file', $('#file')[0].files[0]);

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data);
        $('#fileinfo').prepend(
          '<div class="img-container"><img src="/uploads' +
            data.filePath +
            '" alt="" /></div>'
        );
      },
      error: function(e) {
        console.log(e);
      }
    });
  });

  // inserting image
  $('.img-container').on('click', function() {
    var imageId = $(this).attr('id');
    var txt = $('#post-body');
    var caretPos = txt[0].selectionStart;
    var textAreaTxt = txt.val();
    var txtToAdd = '![alt text](image' + imageId + ')';
    txt.val(
      textAreaTxt.substring(0, caretPos) +
        txtToAdd +
        textAreaTxt.substring(caretPos)
    );
  });

  $('.del-post').on('click', function(e) {
    e.preventDefault();
    var urlDel = $(this).attr('id');
    //alert(urlDel);
    $.ajax({
      url: '/post/'+urlDel,
      type: 'DELETE',
      success: function() {
        $(location).attr('href', '/');
      }
    });
  });

  
  $('.likes').on('click', function(e) {
    e.preventDefault();

    var data = {
      postId: $(this).attr('id'),
    };

    var urlPost = $(this).attr('data-url');
    // alert(urlPost);
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/posts/'+urlPost,
    }).done(function(data) {
      console.log(data);
      if (!data.ok) {
        //alert(data.likeCount);
        //alert( $('.likes').text());
        $('.likes').text('Like: '+data.likeCount);
        //$(location).attr('href', '/posts/'+urlPost);
      } else {
        alert(data.likeCount);
      // $(location).attr('href', '/posts/'+urlPost);
      //   $.ajax({
      //   type: 'GET',
      //   contentType: 'application/json',
      //   url: '/posts/'+urlPost,
      // }).done(function(html){
      //   console.log('ok');

      // })
      }
    });
  });

});


/* eslint-enable no-undef */
