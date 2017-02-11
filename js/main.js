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
    var _opts = _.assign({}, {
      dataUrl: null,
      dataMap: null,
      templateCreator: null,
      paginationBtnCreator: null,
      containerClass: null
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
          case 'paginationBtnCreator':
            if (!val) {
              throw new Error('Please provide a `paginationBtnCreator`');
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
    var _data = null;
    var _filterOpts = {
      resultsPerPage: 10,
      moreThanTenLikes: false,
      searchInDescText: ''
    };
    var _currentPage = null;
    var _pagination = {
      index: 0,
      hasNext: false,
      hasPrev: false
    };
    var _shouldRefreshOnOptsChange = [

    ];

    /**
     * public props
     */
    _self.ready = false;

    /**
     * set pagination data
     *
     * @param {arr} filteredData
     * @param {str} paginateDirection
     * @return {void}
     * @api @private
     */
    function setPagination(data, dir) {
      var rpp = _filterOpts.resultsPerPage;
      var index = _pagination.index;
      var currentIndex = index, nextIndex, prevIndex, nextPage, prevPage;
      if (dir === 'next') {
        currentIndex = index + rpp;
      }
      if (dir === 'prev') {
        currentIndex = index - rpp;
      }
      nextIndex = currentIndex + rpp;
      prevIndex = currentIndex - rpp;
      // set pages
      _currentPage = data.slice(currentIndex, currentIndex + rpp);
      nextPage = data.slice(nextIndex, nextIndex + rpp);
      prevPage = data.slice(prevIndex, currentIndex);
      // set pagination
      _pagination.hasNext = nextPage.length !== 0;
      _pagination.hasPrev = prevPage.length !== 0;
      _pagination.index = currentIndex;
    } // end-setPagination

    /**
     * set filter options
     *
     * @param {obj} newOptions
     * @return {}
     * @api @public
     */
    function setFilterOpts(opts) {
      _filterOpts = _.assign({}, _filterOpts, opts);
    } // end-setFilterOpts

    /**
     * filter the data
     *
     * @param {}
     * @return {arr}
     * @api @private
     */
    function filterData() {
      var newData = _data.concat();
      if (_filterOpts.moreThanTenLikes) {
        newData = _.filter(newData, function (obj) {
          return parseInt(obj.userLikes) > 10;
        });
      }
      if (_filterOpts.searchInDescText.length !== 0) {
        newData = _.filter(newData, function (obj) {
          return obj.desc && obj.desc.search(_filterOpts.searchInDescText) !== -1;
        });
      }
      return newData;
    } // end-filterData

    /**
     * render the stored data
     * based on the given options
     *
     * @param {str} paginationDirection
     * @return {void}
     * @api @public
     */
    function render(dir) {
      var $con = $('.' + _opts.containerClass);
      // set/update pagination data
      setPagination(filterData(), dir);
      // clear $con
      $con.html('');
      // render
      if (_currentPage.length > 0) {
        _.each(_currentPage, function (videoData) {
          $con.append(_opts.templateCreator(videoData));
        });
        // render pagination btns
        if (_pagination.hasNext && _pagination.hasPrev) {
          $con.append(_opts.paginationBtnCreator('prev', render), _opts.paginationBtnCreator('next', render));
        } else if (_pagination.hasNext && !_pagination.hasPrev) {
          $con.append(_opts.paginationBtnCreator('next', render));
        } else if (!_pagination.hasNext && _pagination.hasPrev) {
          $con.append(_opts.paginationBtnCreator('prev', render));
        }
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
        _.each(videos, function (video) {
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
        _data = mapData(JSON.parse(res).data);
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
    this.setFilterOpts = setFilterOpts;

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
          class: 'show-' + name + ' btn btn-default btn-xs',
          href: '#'
        })
          .html('show ' + name)
          .on('click', function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var $parent = $target.parents('.video-desc');
            if ($target.hasClass('show-more')) {
              $parent.addClass('more');
            } else {
              $parent.removeClass('more');
            }
          });
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
    paginationBtn: function (dir, clickAction) {
      return $('<a>', {
        class: 'pagination-btn btn btn-default btn-sm pull-' + (dir === 'next' ? 'right' : 'left')
      })
        .html(dir)
        .on('click', function (e) {
          e.preventDefault();
          clickAction(dir);
          $('html, body').scrollTop(0);
        });;
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
      // element created with the given data
      templateCreator: $templates.video,
      // function that returns the pagination
      // button jQuery elemen
      paginationBtnCreator: $templates.paginationBtn,
      // class name of the container element
      // where the templates will be rendered
      containerClass: 'videos'
    });

    // app's code
    function init() {
      // first render
      videoFeed.render();

      /**
       * filter events listeners
       */
      // above ten likes
      $('input[name="above-ten-likes"]').on('change', function (e) {
        // set mttl option
        videoFeed.setFilterOpts({
          moreThanTenLikes: e.target.checked
        });
        // re render
        videoFeed.render();
      });

      // search in desc
      $('input[name="search-in-desc"]').on('input', function (e) {
        // set mttl option
        videoFeed.setFilterOpts({
          searchInDescText: e.target.value
        });
        // re render
        videoFeed.render();
      });

      // results per page
      $('.results-per-page').on('click', function (e) {
        e.preventDefault();
        var $btn = $(e.target);
        // set active state class
        $btn
          .addClass('active')
          .siblings().removeClass('active');
        // set rpp option
        videoFeed.setFilterOpts({
          resultsPerPage: parseInt(e.target.innerHTML)
        });
        // re render
        videoFeed.render();
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
