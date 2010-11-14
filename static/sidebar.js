
function display_sidebar_stats(start, end) {
   //var days_pie, hours_pie;
   $.getJSON('/events/stats.json', {start: start.getTime(), end: end.getTime()}, function(response) {
      if (response.days_spent && response.days_spent.length) {
         $('#days-plot:hidden').show();
         $.jqplot('days-plot', [response.days_spent], {
             title: 'Days spent',
             grid: { drawGridLines: false, gridLineColor: '#fff', background: '#fff',  borderColor: '#fff', borderWidth: 1, shadow: false },
             highlighter: {sizeAdjust: 7.5},
             seriesDefaults:{renderer:$.jqplot.PieRenderer, rendererOptions:{sliceMargin:3, padding:7, border:false}},
           legend:{show:true}
        });
      } else {
         $('#days-plot:visible').hide();
      }

      if (response.hours_spent && response.hours_spent.length) {
         $('#hours-plot:hidden').show();
         $.jqplot('hours-plot', [response.hours_spent], {
             title: 'Hours spent',
             grid: { drawGridLines: false, gridLineColor: '#fff', background: '#fff',  borderColor: '#fff', borderWidth: 1, shadow: false },
             seriesDefaults:{renderer:$.jqplot.PieRenderer, rendererOptions:{sliceMargin:3, padding:7, border:false}},
           legend:{show:true}
        });
      } else {
         $('#hours-plot:visible').hide();
      }
      
   });
}


var jqplot_loaded = false;
$(function() {
   $.getScript(JS_URLS.jqplot, function() {
      $.getScript(JS_URLS.jqplot_pierenderer, function() {
         var view = $('#calendar').fullCalendar('getView');
         jqplot_loaded = true;
         display_sidebar_stats(view.start, view.end);
      });
   });

   $('a.user-settings').fancybox({
      'width': '75%',
      'height': '75%',
      'scrolling': 'no',
      'transitionIn': 'none',
      'transitionOut': 'none',
      //'type': 'iframe',
      onClosed: function() {
	 //location.href='/'; // works but not ideal
      }
   });
   
   $('a.vimeovideo').fancybox({
      'width': '60%',
      'height': '65%',
      'transitionIn': 'none',
      'transitionOut': 'none',
      'type': 'iframe'
   });
      
      $('a.share').fancybox({
         'width': '75%',
         'height': '75%',
         'scrolling': 'no',
         'transitionIn': 'none',
         'transitionOut': 'none',
         onComplete: function(array, index, opts) {
            if ($('#close-sharing-open-account').size()) {
               $('#close-sharing-open-account').click(function() {
                  $('a.account').click();
                  return false;
               });
            } else {
               if ($('#share_url').size()) {
                  $('#share_url')[0].focus();
                  $('#share_url')[0].select();
               }
            }
         }
      });
      
      
});