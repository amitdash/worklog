function L() {
   console.log.apply(console, arguments);
}

// Note: variables minDate and maxDate are prepared in the template
// 
var slider;
var startDate;
var endDate;
var dateformat = 'd M yy';

function resync(values) {
   if (values) {
      var date = new Date(minDate.getTime());
      date.setDate(date.getDate() + values[0]);
      startDate.val($.datepicker.formatDate(dateformat, date));
      date = new Date(minDate.getTime());
      date.setDate(date.getDate() + values[1]);
      endDate.val($.datepicker.formatDate(dateformat, date));
   } else {
      var start = daysDiff(minDate, startDate.datepicker('getDate') || minDate);
      var end = daysDiff(minDate, endDate.datepicker('getDate') || maxDate);
      start = Math.min(start, end);
      slider.slider('values', 0, start);
      slider.slider('values', 1, end);
   }
   startDate.datepicker('option', 'maxDate', endDate.datepicker('getDate') || maxDate);
   endDate.datepicker('option', 'minDate', startDate.datepicker('getDate') || minDate);
   
   
   $('a.download-export').each(function(i, e) {
      var href = $(this).attr('href');
      if (href.search(/start=/)==-1) {
         href += '?start=' + startDate.datepicker('getDate').getTime() + 
	   '&end=' + endDate.datepicker('getDate').getTime();
      } else {
         href = href.replace(/start=(\d+)/, 'start=' + startDate.datepicker('getDate').getTime());
         href = href.replace(/end=(\d+)/, 'end=' + endDate.datepicker('getDate').getTime());
      }
      $(this).attr('href', href);
   });
}

function daysDiff(d1, d2) {
    return  Math.floor((d2.getTime() - d1.getTime()) / 86400000);
}

function plot_users() {
   $.getJSON('/stats/users.json', {
      start: startDate.datepicker('getDate').getTime(),
	end: endDate.datepicker('getDate').getTime()}, 
             function(response) {
                $.jqplot('plot-users', [response.cumm_w_email,
                                             response.new_w_email,
                                             response.cumm_wo_email,
                                             response.new_wo_email], 
                         {
                   title:'Users',
                     legend:{show:true},
                     series:[
                             {label:'Cummulative (with email)', lineWidth:4},
                             {label:'New (with email)', lineWidth:4},
                             {label:'Cummulative (no email)', lineWidth:4},
                             {label:'New (no email)', lineWidth:4}
                     ],
                     
                     //gridPadding:{right:35},
              axes:{
                 yaxis:{
                    tickOptions:{
                       formatString: '%d'
                    },
                    min: 0
                 },
                 xaxis:{
                    renderer:$.jqplot.DateAxisRenderer, 
                      tickOptions:{formatString:'%b %#d %Y'},
                    min:startDate.datepicker('getDate'),
                      tickInterval:'1 month'
                 }
              }
                });
             });
   
   $.getJSON('/stats/events.json', {
      start: startDate.datepicker('getDate').getTime(),
	end: endDate.datepicker('getDate').getTime()}, 
             function(response) {
                $.jqplot('plot-events', [response.cumm,
                                             response['new']], 
                         {
                   title:'Events',
                     legend:{show:true},
                     series:[
                             {label:'Cummulative', lineWidth:4},
                             {label:'New', lineWidth:4}
                     ],
                     
                     //gridPadding:{right:35},
              axes:{
                 yaxis:{
                    tickOptions:{
                       formatString: '%d'
                    },
                    min: 0
                 },
                 xaxis:{
                    renderer:$.jqplot.DateAxisRenderer, 
                      tickOptions:{formatString:'%b %#d %Y'},
                    min:startDate.datepicker('getDate'),
                      tickInterval:'1 month'
                 }
              }
                });
             });   
}


function refresh_date_range() {
   plot_users();
}

$(function() {
   $.jqplot.config.enablePlugins = true;
   if (!$('#from_date').val()) {
      $('#from_date').val($.datepicker.formatDate(dateformat, minDate));
   }
   if (!$('#to_date').val()) {
      $('#to_date').val($.datepicker.formatDate(dateformat, maxDate));
   }
    
    slider = $('#slider').slider({range: true, max: daysDiff(minDate, maxDate),
            stop: function(event, ui) {
              still_sliding = false;
              refresh_date_range();
            },
            slide: function(event, ui) { resync(ui.values); }});
    startDate = $('#from_date').datepicker({
        firstDay: SETTINGS.monday_first ? 1 : 0,
        minDate: minDate, 
        maxDate: maxDate,
        dateFormat: dateformat,
        onSelect: function(dateStr) { 
          resync();
          refresh_date_range();
        }}).
        keyup(function() { resync(); });
    endDate = $('#to_date').datepicker({
        firstDay: SETTINGS.monday_first ? 1 : 0,
            minDate: minDate, 
            maxDate: maxDate,
            dateFormat: dateformat,
            onSelect: function(dateStr) { 
              resync();
              refresh_date_range();
            }}).
        keyup(function() { resync(); });
   

   resync();
   refresh_date_range();   
});