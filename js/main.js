(function($, _) {
  'use strict';

  /**
   * [VideoFeed the video feed constructor function]
   * @param {[obj]} opts [init options]
   */
  function VideoFeed(opts) {
    /**
     * options
     */
    var _opts = $.extend({}, {
      dataUrl: null
    }, opts);

    // check _opts
    for (var key in _opts) {
      if (_opts.hasOwnProperty(key)) {
        var val = _opts[key];
        switch (key) {
          case 'dataUrl':
            if (!val) {
              throw new Error('Please specify a `dataUrl`');
            }
            break;
          default:
            if (!val) {
              throw new Error('Please check the options');
            }
        }
        console.log('Success :', 'Options are looking good.');
      }
    }

    /**
     * private props
     */
    var _self = this;

    /**
     * public props
     */
    _self.data = null;

    /**
     * render the given jQuery elems
     * withing the given container
     *
     * @param {arr} elements
     * @param {jQuery} container
     * @return {void}
     * @api @public
     */
    function render($elems, $container) {
      $.each($elems, function (i, elem) {
        $container.append($(elem));
      });
    }; // end-render

    /**
     * get the json data and store
     * it within the data prop
     *
     * @param {str} dataUrl
     * @return {void}
     * @api @private
     */
    function getData(dataUrl) {
      $.ajax({
        url: dataUrl,
        method: 'GET',
        dataType: 'text'
      })
      .done(function (res) {
        console.log('Success :', 'Data fetched successfully');
        _self.data = JSON.parse(res);
        console.log('Success :', 'Data parsed and stored.');
      })
      .fail(function (err) {
        console.log('Error :', 'Couln\'t fetch the data.');
        console.log('Error Object :');
        console.log(err);
      });
    }; // end-getData

    // expose methods
    this.render = render;

    // init
    getData(opts.dataUrl);
  } // end-VideoFeed

  /**
   * [$elements app's jQuery elements]
   * @type {Object}
   */
  var $elements = {
    /**
     * video element
     *
     * @param {obj} videoData
     * @return {jQuery} videoElem
     */
    video: function (data) {
      /**
       * container
       */
      var $con = $('<div>', {
        class: 'video'
      });

      /**
       * user image
       */
      var $userImg = $('<div>', {
        class: 'user-img'
      }).append($('<a>', {
        href: data.userUrl,
        target: '_blank'
      }).append($('<img>', {
        class: 'img-rouded',
        src: data.userImgUrl,
        alt: data.userName
      })));

      /**
       * user name
       */
      var $userName = $('<a>', {
        href: data.userUrl,
        target: '_blank'
      }).append($('<strong>').html(data.userName));

      /**
       * video title
       */
      var $videoTitle = $('<a>', {
        href: data.videoUrl,
        target: '_blank'
      }).append($('<h3>', {
          class: 'title text-success'
        }).html(data.videoTitle));

      /**
       * video desc
       */
      var $videoDesc = $('<p>').html(data.videoDesc);
      function videoDescBtn(name) {
        return $('<a>', {
          class: 'show-' + name + ' btn btn-primary btn-xs',
          href: '#'
        }).html('show ' + name);
      }

      /**
       * video detail item
       */
      function videoDetailItem(type) {
        var color, html, icon;
        switch (type) {
          case 'views':
            color = 'success';
            html = data.videoViews;
            icon = 'eye-open';
            break;
          case 'likes':
            color = 'danger';
            html = data.videoLikes;
            icon = 'heart';
            break;
          case 'comments':
            color = 'primary';
            html = data.videoComments;
            icon = 'comment';
            break;
          default:
            color = 'default';
        }
        return $('<li>', {
          class: 'text-' + color
        })
          .html(html)
          .prepend($('<span>', {
            class: 'icon glyphicon glyphicon-' + icon
          }));
      }

      /**
       * video infos
       */
      var $videoInfos = $('<div>', {
        class: 'video-infos'
      })
        // user name
        .append($('<div>', {
          class: 'user-name'
        }).append($userName))
        // video title
        .append($('<div>', {
          class: 'video-title'
        }).append($videoTitle))
        // video desc
        .append($('<div>', {
          class: 'video-desc'
        })
          // video desc text
          .append($videoDesc)
          // video desc btns
          .append(videoDescBtn('more'))
          .append(videoDescBtn('less')))
        // video details
        .append($('<div>', {
          class: 'video-details'
        })
          // video details list
          .append($('<ul>', {
            class: 'list-unstyled'
          })
            // video details list items
            .append(videoDetailItem('views'))
            .append(videoDetailItem('likes'))
            .append(videoDetailItem('comments'))));

      // return the whole video elem
      return $con
        .append($userImg)
        .append($videoInfos);
    }
  }; // end-$elements

  // init
  $(document).ready(function () {
    var videoFeed = new VideoFeed({
      dataUrl: '/data.json'
    });

    window.videoFeed = videoFeed;

    videoFeed.render([
      $elements.video({
        userName: 'username',
        userUrl: 'userurl',
        userImgUrl: 'userimgurl',
        videoTitle: 'videotitle',
        videoUrl: 'videourl',
        videoDesc: 'videodesc',
        videoViews: '1000',
        videoLikes: '233',
        videoComments: '23'
      })
    ], $('.videos'));
  });
})(jQuery, _);
