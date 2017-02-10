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
    title: function () {
      return $('<h1>').html('Video Feed!');
    }
  }; // end-$elements

  // init
  $(document).ready(function () {
    var videoFeed = new VideoFeed({
      dataUrl: '/data.json'
    });

    window.videoFeed = videoFeed;

    // test
    videoFeed.render([$elements.title()], $('.container'));
  });
})(jQuery, _);
