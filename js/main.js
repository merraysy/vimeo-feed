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
      dataMap: null,
      templateCreator: null,
      containerClass: null,
      resultsPerPage: 10
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
          case 'templateCreator':
            if (!val) {
              throw new Error('Please provide a `templateCreator`');
            }
            break;
          case 'containerClass':
            if (!val) {
              throw new Error('Please specify a `containerClass`');
            }
            break;
          default:
            if (!val) {
              throw new Error('Please check the options');
            }
        }
      }
    }

    console.log('Success :', 'Options are looking good.');

    /**
     * private props
     */
    var _self = this;

    /**
     * public props
     */
    _self.data = null;
    _self.ready = false;
    _self.pagination = {
      currentIndex: 0,
      currentPage: []
    };

    /**
     * set `resultsPerPage` option
     *
     * @param {int} resultsPerPage
     * @return {void}
     * @api @public
     */
    function setResultsPerPage(number) {
      var num = parseInt(number);
      if (!Number.isNaN(num)) {
        _opts.resultsPerPage = num;
      } else {
        throw new Error('`resultsPerPage` must be an integer.');
      }
    } // end-setResultsPerPage

    function getPage() {
      var rpp = _opts.resultsPerPage;
      var index = _self.pagination.currentIndex;
      var current = _self.pagination.currentPage;
      // set current
      current = _self.data.slice(index, rpp);
      // set index
      index = current.length - 1;
    } // end-getPage

    /**
     * filter the data
     *
     * @param {arr} data
     * @param {obj} options
     * @return {arr}
     * @api @private
     */
    function filterData(opts) {
      var newData = _self.data.concat();
      if (opts.moreThanTenLikes) {
        newData = _.filter(data, function (obj) {
          return parseInt(obj.likes) > 10;
        });
      }
      return newData;
    } // end-filterData

    /**
     * render the stored data
     * based on the given options
     *
     * @param {obj} options
     * @return {void}
     * @api @public
     */
    function render(opts) {
      var data = filterData(_self.data, opts);
      var $con = $('.' + _opts.containerClass);

      if (data.length > 0) {
        $.each(data, function (i, videoData) {
          $con.append(_opts.templateCreator(videoData));
        });
        $con.append(opts.paginationBtn('left'), opts.paginationBtn('right'));
      } else {
        $con.html('0 videos found.');
      }

      console.log('Success :', 'Data rendered.');
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
                if (typeof ref === 'undefined') continue;
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
        console.log('Success :', 'Data fetched.');
        _self.data = mapData(JSON.parse(res).data);
        console.log('Success :', 'Data parsed and stored.');
        _self.ready = true;
        console.log('Success :', 'Video Feed is ready.');
      })
      .fail(function (err) {
        console.log('Error :', 'Couln\'t fetch the data.');
        console.log('Error Object :');
        console.log(err);
      });
    }; // end-getData

    // expose methods
    this.render = render;
    this.setResultsPerPage = render;

    // init
    getData(opts.dataUrl);
  } // end-VideoFeed

  /**
   * app's jQuery templates
   *
   * @type {obj}
   */
  var $templates = {
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
        class: 'img-rounded',
        src: data.userImgUrl ? data.userImgUrl : 'https://i2.wp.com/i.vimeocdn.com/portrait/defaults-red_75x75.png',
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
          case 'plays':
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
          class: 'video-desc' + (!data.desc || data.desc && data.desc.length <= 200 ? ' short' : '')
        })
          // desc text
          .append($desc)
          // desc btns
          .append(descBtn('more'), descBtn('less')))
        // details
        .append($('<div>', {
          class: 'video-details'
        })
          // details list
          .append($('<ul>', {
            class: 'list-unstyled'
          })
            // details list items
            .append(data.plays ? detailItem('plays') : '', data.likes ? detailItem('likes') : '', data.comments ?  detailItem('comments') : '')));

      // return the whole video elem
      return $con.append($userImg, $videoInfos);
    },
    paginationBtn: function (dir) {
      return $('<a>', {
        class: 'pagination-btn btn btn-primary btn-sm pull-' + dir
      }).html(dir === 'right' ? 'next' : 'prev');
    }
  }; // end-$templates

  // init
  $(document).ready(function () {
    // videoFeed object
    var videoFeed = new VideoFeed({
      // url to grap the data from
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
        userImgUrl: 'user.pictures.sizes.1.link',
        userLikes: 'user.metadata.connections.likes.total'
      },
      // function that returns the jQuery
      // element with the given data
      templateCreator: $templates.video,
      // class name of the container element
      // where the templates will be rendered
      containerClass: 'videos'
    });

    // app's code
    function init() {
      videoFeed.render({
        moreThanTenLikes: false,
        keywords: '',
        paginationBtn: $templates.paginationBtn
      });
    };

    // wait for ready state
    var waitForReadyStateInterval = setInterval(function () {
      if (videoFeed.ready) {
        clearInterval(waitForReadyStateInterval);
        init();
      }
    }, 10);
  });
})(jQuery, _);
