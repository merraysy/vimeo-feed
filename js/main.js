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
      dataUrl: null,
      dataMap: null
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
          case 'dataMap':
            if (!val) {
              throw new Error('Please configure the `dataMap`');
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
      function mapData(videos) {
        var newVideos = [];
        $.each(videos, function (i, video) {
          var newVideo = {};
          for (var key in _opts.dataMap) {
            if (_opts.dataMap.hasOwnProperty(key)) {
              var list = _opts.dataMap[key].split('.');
              var ref = null;
              var numRe = /\d/g;
              for (var i = 0; i < list.length; i++) {
                var k = numRe.test(list[i]) ? parseInt(list[i]) : list[i];
                if (!ref) {
                  ref = video[k];
                } else {
                  ref = ref[k];
                }
              }
              newVideo[key] = typeof ref !== 'undefined' ? ref : null;
            }
          }
          newVideos.push(newVideo);
        });
        return newVideos;
      } // end-mapData

      $.ajax({
        url: dataUrl,
        method: 'GET',
        dataType: 'text'
      })
      .done(function (res) {
        console.log('Success :', 'Data fetched successfully');
        _self.data = mapData(JSON.parse(res).data);
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
     * element
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
       * name
       */
      var $name = $('<a>', {
        href: data.url,
        target: '_blank'
      }).append($('<h3>', {
          class: 'name text-success'
        }).html(data.name));

      /**
       * desc
       */
      var $desc = $('<p>').html(data.desc);
      function descBtn(name) {
        return $('<a>', {
          class: 'show-' + name + ' btn btn-primary btn-xs',
          href: '#'
        }).html('show ' + name);
      }

      /**
       * detail item
       */
      function detailItem(type) {
        var color, html, icon;
        switch (type) {
          case 'views':
            color = 'success';
            html = data.plays;
            icon = 'eye-open';
            break;
          case 'likes':
            color = 'danger';
            html = data.likes;
            icon = 'heart';
            break;
          case 'comments':
            color = 'primary';
            html = data.comments;
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
       * infos
       */
      var $videoInfos = $('<div>', {
        class: 'video-infos'
      })
        // user name
        .append($('<div>', {
          class: 'user-name'
        }).append($userName))
        // title
        .append($('<div>', {
          class: 'video-name'
        }).append($name))
        // desc
        .append($('<div>', {
          class: 'video-desc'
        })
          // desc text
          .append($desc)
          // desc btns
          .append(descBtn('more'))
          .append(descBtn('less')))
        // details
        .append($('<div>', {
          class: 'video-details'
        })
          // details list
          .append($('<ul>', {
            class: 'list-unstyled'
          })
            // details list items
            .append(detailItem('views'))
            .append(detailItem('likes'))
            .append(detailItem('comments'))));

      // return the whole video elem
      return $con
        .append($userImg)
        .append($videoInfos);
    }
  }; // end-$elements

  // init
  $(document).ready(function () {
    var videoFeed = new VideoFeed({
      // url where to grap the data
      dataUrl: '/data.json',
      // options to map the data
      // keep only what's needed.
      // the value is a string of nested
      // props and indexs separated by dots.
      dataMap: {
        name: 'name',
        url: 'link',
        desc: 'description',
        plays: 'stats.plays',
        likes: 'metadata.connections.likes.total',
        comments: 'metadata.connections.comments.total',
        userName: 'user.name',
        userUrl: 'user.link',
        userImgUrl: 'user.pictures.sizes.1.link'
      }
    });

    videoFeed.render([
      $elements.video({
        userName: 'username',
        userUrl: 'userurl',
        userImgUrl: 'userimgurl',
        name: 'title',
        url: 'url',
        desc: 'desc',
        plays: '1000',
        likes: '233',
        comments: '23'
      })
    ], $('.videos'));
  });
})(jQuery, _);
