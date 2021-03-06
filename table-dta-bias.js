$( document ).ajaxComplete(function() {
	//Background-color of cells
	$( "td:contains('Unclear')" ).css('background-color', '#ffcccc' );
	$( "td:contains('High')" ).css('background-color', '#ff5959' );
	$( "tr:contains('Unclear')").find('td:first').css('background-color', '#ffcccc' );
	$( "tr:contains('High')").find('td:first').css('background-color', '#ff5959' );
	//Event handlers in the xml
	$('a.hastip_intitle').mouseenter(function(event){
		var tiptext = $(this).attr('title');
		var trigger = $(this);
		var width = "200px"
		showtip(tiptext, trigger, width);
		});
});
$(document).ready(function(){
//Write header
$("#header_bias").html("<table><caption>Possible bias in studies of diagnostic test accuracy for this topic<br><a href=\"http://www.bris.ac.uk/quadas/quadas-2/\" style=\"font-size:12px\">Criteria for individual items from QUADAS-2</a></caption><tr><th class='col1'>Study</th><th>Patient selection</th><th>Index test performance</th><th>Reference test performance</th><th>Flow and timing of subjects</th><th>Other biases</th><th style='width:7px;background-color:white;border: 1px solid white'></th></tr></table>");
//Get xml for table
var url = "/" + repo_dir + "/tables/bias.xml";
        $.ajax({
            type: "GET",
            url: url,
            cache: false,
            dataType: "xml",
            error: function() {
                alert("The XML File," + url + ", could not be processed correctly.");
                },
            success: function(xml) {
			var totalsubjects = 0;
			var highrisksubjects = 0;
			var unclearrisksubjects = 0;
			$(xml).find('study').each(function(){
					var patient_selection = [], index_test = [], reference_standard = [], flow_timing = [], other_biases = [];
					var citationtext = $(this).find('citation').text() + ', ' + $(this).find("citation").attr("year") + "<br>"
					if ( $(this).find('citation').attr('pmid')){
						if ( $(this).find('citation').attr('pmid').length > 4){
							citationtext += "PMID: <a href='http://pubmed.gov/" + $(this).find('citation').attr('pmid') + "'>" + $(this).find('citation').attr('pmid') + "</a><br>"
							}
						}
					if ( $(this).find('citation').attr('trialregistration')){
						if ( $(this).find('citation').attr('trialregistration').toLowerCase().indexOf("nct") >= 0){
							citationtext += "<a href='https://clinicaltrials.gov/ct2/show/study/" + $(this).find('citation').attr('trialregistration') + "'>" + $(this).find('citation').attr('trialregistration') + "</a><br>"
							}
						if ( $(this).find('citation').attr('trialregistration').toLowerCase().indexOf("isrctn") >= 0){
							citationtext += "<a href='http://www.isrctn.com/" + $(this).find('citation').attr('trialregistration') + "'>" + $(this).find('citation').attr('trialregistration') + "</a><br>"
							}
						}
					citationtext += "Subjects: " + $(this).find('citation').attr('totalsubjects')
					totalsubjects += parseFloat($(this).find('citation').attr('totalsubjects'))
					if ($(this).text().indexOf("igh")>0){
						highrisksubjects    += parseFloat($(this).find('citation').attr('totalsubjects'))
						}
					if ($(this).text().indexOf("igh")>0 || $(this).text().indexOf("nclear")>0){
						unclearrisksubjects += parseFloat($(this).find('citation').attr('totalsubjects'))
						}
					$(this).find('patient_selection').each(function(){
						patient_selection = $(this).text()
						if (this.hasAttribute('explanation')){
							if ($(this).attr('explanation').length>8){
								patient_selection = "<a href=\"#\" class=\"hastip_intitle\" title=\"" + $(this).attr('explanation')+ "\">" + $(this).text() + "</a>"
								}
							}
						})
					$(this).find('index_test').each(function(){
						index_test = $(this).text()
						if (this.hasAttribute('explanation')){
							if ($(this).attr('explanation').length>8){
								index_test = "<a href=\"#\" class=\"hastip_intitle\" title=\"" + $(this).attr('explanation')+ "\">" + $(this).text() + "</a>"
								}
							}
						})
					$(this).find('reference_standard').each(function(){
						reference_standard = $(this).text()
						if (this.hasAttribute('explanation')){
							if ($(this).attr('explanation').length>8){
								reference_standard = "<a href=\"#\" class=\"hastip_intitle\" title=\"" + $(this).attr('explanation')+ "\">" + $(this).text() + "</a>"
								}
							}
						})
					$(this).find('flow_timing').each(function(){
						flow_timing = $(this).text()
						if (this.hasAttribute('explanation')){
							if ($(this).attr('explanation').length>8){
								flow_timing = "<a href=\"#\" class=\"hastip_intitle\" title=\"" + $(this).attr('explanation')+ "\">" + $(this).text() + "</a>"
								}
							}
						})
					$(this).find('other_biases').each(function(){
						other_biases = $(this).text()
						if (this.hasAttribute('explanation')){
							if ($(this).attr('explanation').length>8){
								other_biases = "<a href=\"#\" class=\"hastip_intitle\" title=\"" + $(this).attr('explanation')+ "\">" + $(this).text() + "</a>"
								}
							}
						})
				var trHTML = '<tr><td>' +  citationtext + '</td><td>' + patient_selection + '</td><td>' + index_test + '</td><td>' + reference_standard + '</td><td>' + flow_timing + '</td><td>' + other_biases + '</td></tr>';
			        $('#citations').append(trHTML);
			})

			//summary judgment
			var ratio = 0;
			var denom = $(xml).find('study').length;
			$("#judgment").html('Low risk')
			//ratio = $(xml).find("study:contains(High)").length/denom;
			$("#rationale").html("\'Most information (<span style='color:red;font-weight:bold'>" + eval(100*(1-unclearrisksubjects/totalsubjects)).toFixed(1) + "% of " + totalsubjects + " patients</span>) is from studies at low risk of bias.\' (<a href=\'http://handbook.cochrane.org/chapter_8/table_8_7_a_possible_approach_for_summary_assessments_of_the.htm\'>Cochrane Handbook</a>)");
			//alert("Unclear/high risk proportion:\n" + eval(100*(unclearrisksubjects)/totalsubjects).toFixed(1)+"%")
			if (unclearrisksubjects/totalsubjects > 0.5){
			//Below is per Cochrane, but does not seem sensible as a study could have most trials low risk and also have most trials low or unclear.
			//if (1-highrisksubjects/totalsubjects > 0.5){
				$("#judgment").html('Unclear risk');
				$("#judgment").css('background-color','#ffcccc');
				$("#rationale").html("\'Most information (<span style='color:red;font-weight:bold'>" + eval(100*unclearrisksubjects/totalsubjects).toFixed(1) + "% of " + totalsubjects + " patients</span>) is from studies at unclear or high risk of bias.\' (modified from <a href=\'http://handbook.cochrane.org/chapter_8/table_8_7_a_possible_approach_for_summary_assessments_of_the.htm\'>Cochrane Handbook</a>)");
			};
			//ratio = $(xml).find("study:contains(Unclear)").length/denom;
			//alert("High risk proportion:\n"        + eval(100*highrisksubjects/totalsubjects).toFixed(1)+"%")
			if (highrisksubjects/totalsubjects > 0.5){
				$("#judgment").html('High risk');
				$("#judgment").css('background-color','#ff5959');
				$("#rationale").html("\'The proportion of information (<span style='color:red;font-weight:bold'>" + eval(100*highrisksubjects/totalsubjects).toFixed(1) + "% of " + totalsubjects + " patients</span> from studies at high risk of bias is sufficient to affect the interpretation of results.\' (<a href=\'http://handbook.cochrane.org/chapter_8/table_8_7_a_possible_approach_for_summary_assessments_of_the.htm\'>Cochrane Handbook</a>)");
			};

                }
      });
     
	//Write footer
	//Reuse
	$("#business-bias").append("<div style='text-align:center'><a href='https://github.com/openMetaAnalysis/openMetaAnalysis.github.io/blob/master/reusing.MD'>Cite &amp; use this content</a></div>")
	//Edit and history
	$("#business-bias").append("<div style='text-align:center'>Source content: <a href='/" + repo_dir + "/tables/bias.xml'>view</a> - <a href='https://github.com/openMetaAnalysis/" + repo_dir + "/commits/gh-pages/tables/bias.xml'>history</a> - <a href='https://github.com/openMetaAnalysis/" + repo_dir + "/blob/gh-pages/tables/bias.xml'>edit</a> (Hint: use <a href=\"https://kobra.io\">Kobra</a> for collaborative editing)</div>")
	//Issues and comments
	$("#business-bias").append("<div style='text-align:center'><a href='https://github.com/openMetaAnalysis/" + repo_dir + "/issues?q=is%3Aopen+is%3Aissue'>Issues and comments</a></div>")
});
