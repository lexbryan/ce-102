var dam_case = 1;
var sg_liquid = 0;
var sg_concrete = 0;
var dam_height = 0;
var dam_top_width = 0;
var dam_bottom_width = 0;
var liquid_height = 0;
var downstream_liquid_height = 0;
var sliding_coefficient = 0;

var is_uplift = false;
var is_downstream = false;
var is_overflowing = false;

// for dam ui

function onload(){
    $("#uplift-pressure").toggle();
    $('#water-spill').toggle();
    $('#water-downstream').toggle();
}

function sh(element_name){
    
    if(element_name == "overflowing"){ 
        $('#water-spill').toggle();
        element_name = "downstream_upstream";
        is_overflowing = true;
    }
    else if(element_name == "downstream_upstream"){ 
        $('#water-downstream').toggle();
        element_name = "overflowing";
        is_overflowing = false;
        
        $('#uplift').toggle();
        $('#_uplift').toggle();
        $("#uplift-pressure").toggle();
        
        if(is_uplift) is_uplift = false;
        else is_uplift = true;
        
        if(is_downstream) is_downstream = false;
        else is_downstream = true;
    }
    
    $("#"+element_name).toggle();
    $("#_"+element_name).toggle();
    $("#label_"+element_name).toggle();
    
    if($('#water-spill').css('display') != "none"){
        $('#water-bottom').css('height', '100%');
        $('#water-bottom').css('margin-top', '-20%');
        
        $('#water-top').css('visibility','hidden');
        $('#water-left-container').css('height','190px');
        $('#water-left-container').css('margin-top','10px');
        $('#top-resizer').css('height','10px');
    }
    else{
        $('#water-bottom').css('height', '85%');
        $('#water-bottom').css('margin-top', '0%');
        
        $('#water-top').css('visibility','visible');
        $('#water-left-container').css('height','200px');
        $('#water-left-container').css('margin-top','0px');
        $('#top-resizer').css('height','0px');
    }
}

function uplift_visibility(){
    $("#uplift-pressure").toggle();
    
    //set uplift variable
    if(is_uplift) is_uplift = false;
    else is_uplift = true;
}


// when proceed is clicked
function proceed(){
    $('#form-cases').toggle();
    $('#form-values').toggle();
    get_case();
    if(is_downstream) $('#downstream-liquid').toggle();
    
    return false;
}

function goto_home(){
    $('#form-cases').toggle();
    $('#form-values').toggle();
    
    //document.getElementById('form-values').reset();
    //document.getElementById('form-cases').reset();
    location.reload();
    
    return false;
}

function get_case(){
    
    if(is_uplift && is_overflowing) dam_case = 4;
    else if(is_overflowing) dam_case = 3;
    else if(is_downstream && is_uplift) dam_case = 5;
    else if(is_downstream) dam_case = 6;
    else if (is_uplift) dam_case = 2;
    else dam_case = 1;
}

// set ui
function change_liquid_height(){    
    liquid_height = Number($('#liquid-height').val());
    dam_height = Number($('#dam-height').val());
    
    if(is_overflowing){
        if(liquid_height <= dam_height && liquid_height != 0 && dam_height != 0){
            alert("Height of water should be greater than the height of the dam!");
            $('#liquid-height').val('0');
            $('#dam-height').val('0');
        }
        
        return false;
    }
        
    if(liquid_height <= dam_height && dam_height != 0 && !is_overflowing){
        var height = (liquid_height/dam_height)*100;
        
        if(height > 15){
            $('#water-bottom').css('height', (height-15)+'%');
            $('#water-resizer').css('height', (100-height) + '%');
        }
        else{
            $('#water-bottom').css('height','0%');
            $('#water-resizer').css('height','85%');
        }
        
        $('#pressure').css('height', height+'%');
        $('#pressure-resizer').css('height', (100-height)+'%');
    }
    else{
        alert("Set the height of the dam to be greater than the height of the liquid!");
        
        $('#dam-height').val(0);
        $('#liquid-height').val(0);
    }
}


// when calculate is clicked

function calculate(){
    //get force due to hydrostatic pressure
    sg_liquid = Number($('#liquid-sg').val());
    liquid_height = Number($('#liquid-height').val());
    downstream_liquid_height = Number($('#downstream-height').val());
    sg_concrete = Number($('#concrete-sg').val());
    dam_height = Number($('#dam-height').val());
    dam_top_width = Number($('#dam-top-width').val());
    dam_bottom_width = Number($('#dam-bottom-width').val());
    sliding_coefficient = Number($('#sliding-coefficient').val());
    
    if(dam_bottom_width < dam_top_width){
        alert("Man no dam is constructed that way!");
        return false;
    }
    if(is_downstream && downstream_liquid_height > dam_height){
        alert("We'll consider downstream to overflow in the future!");
        $('#downstream-height').val(0);
        
        return false;
    }
    
    var P = get_p();
    var OM = get_om();
    var RMw = get_rm_w();
    var RM = RMw[0];
    var Ry = RMw[1]; 
    var Ryx_bar = RM - OM;
    var FS = RM/OM;
    var FSs = sliding_coefficient*Ry/P;
    var U = is_uplift ? get_U(): 0;
    var U2 = dam_case == 5 ? get_U2(): 0;
    var P2 = dam_case == 5 ? get_p2(): 0;
    
    
    
    var solution = "<span>Case "+dam_case+":</span><br/><br/>"+
                   "<span>P = "+P.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN</span><br/>"+
                    "<span>RM = "+RM.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN.m</span><br/>"+
                    "<span>OM = "+OM.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN.m</span><br/>"+
                    "<span>Ry = "+Ry.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN</span><br/>"+
                    (is_uplift ? "<span>U = "+U.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN</span><br/>" : "") +
                    ((dam_case == 2 || dam_case == 3) ? "<span>Ryx&#772; = "+Ryx_bar.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" kN.m</span><br/>" : "") +
                    "<span>Factor of safety = "+FS.toFixed(3)+"</span><br/>"+
                    "<span>Factor of safety against sliding = "+FSs.toFixed(3)+"</span><br/>";
    
    $('#solution-container').html(solution);
    
    return false;
}

function get_p(){
    var P = 0;
    var area = 0;
    
    if(liquid_height <= dam_height) area = liquid_height;
    else area = dam_height;
    
    
    
    if(is_overflowing){
        var h_bar = dam_height/2 + (liquid_height-dam_height);
        P = 9.81*sg_liquid*area*h_bar;
    }
    else{
        P = (9.81)*sg_liquid*(liquid_height/2)*area;
    }
    
    return P;
}

function get_p2(){
    return 9.81*sg_liquid*Math.pow(downstream_liquid_height,2)/2;
}

function get_rm_w(){
    var RM = 0;
    var w = 0;
    if(dam_top_width == dam_bottom_width){
        w = 9.81*sg_concrete*dam_height*dam_bottom_width;
        var x1 = dam_bottom_width/2;
        
        RM = w*x1;
    }
    else if(dam_top_width == 0){
        w = 9.81*sg_concrete*dam_height*dam_bottom_width/2;
        var x1 = (2/3)*dam_bottom_width;
        
        RM = w*x1;
    }
    else{
        var v1 = dam_top_width*dam_height;
        var v2 = 0.5*(dam_bottom_width-dam_top_width)*dam_height;
        
        var w1 = 9.81*sg_concrete*v1;
        var w2 = 9.81*sg_concrete*v2;
        
        var x1 = (dam_bottom_width - dam_top_width) + dam_top_width/2;
        var x2 = (dam_bottom_width - dam_top_width)*(2/3);
        
        var w3 = 0;
        var x3 = 0;
        
        var p2 = 0;
        var h2 = 0;
        
        if(is_overflowing){
            w3 = 9.81*sg_liquid*dam_top_width*(liquid_height - dam_height); 
            x3 = dam_top_width/2;
        }
        else if(is_downstream){
            p2 = get_p2();
            h2 = downstream_liquid_height;
        }
        
        RM = w1*x1 + w2*x2 + w3*x3 + p2*h2/3;
        w = w1 + w2 + w3;
    }
    
    return [RM, w];
}

function get_om(){
    var hc = 0;
    
    if(liquid_height > dam_height) hc = liquid_height/2 + (1/12)*Math.pow(dam_height,3)/(liquid_height*0.5*dam_height);
    else hc = liquid_height*2/3;
    
    var OM = get_p()*(liquid_height - hc);
    
    if(is_uplift) OM += get_U()*2*dam_bottom_width/3;
    else if(dam_case == 3){
        var Ig = Math.pow(dam_height,3)/12;
        var h_bar = dam_height/2 + (liquid_height - dam_height);
        var Ss = dam_height*h_bar;
        var e = Ig/Ss; 
            
        OM += get_p() * (dam_height/2 - e);
    }
    
    if(is_downstream) OM += get_U2*dam_bottom_width/2;
    
    return OM;
}

function get_U(){
    
    
    var U = 9.81*sg_liquid*dam_bottom_width*liquid_height/2;
    var U1 = 9.81*sg_liquid*dam_bottom_width*(liquid_height - downstream_liquid_height)/2
        
    return is_downstream ? U1 : U;
}

function get_U2(){
    return 9.81*sg_liquid*dam_bottom_width*downstream_liquid_height;
}

function set_dam_ui(){
    dam_height = Number($('#dam-height').val());
    dam_top_width = Number($('#dam-top-width').val());
    dam_bottom_width = Number($('#dam-bottom-width').val());
    
    
    if(!(dam_height > 0 || dam_top_width > 0 || dam_bottom_width > 0)) return false;
    
    if(dam_top_width > dam_bottom_width && dam_bottom_width != 0){
        alert("Dam's top width should >= to the bottom width!");
        return false;
    }
    else $('#concrete-right-container').css('-webkit-clip-path','polygon(0 0%, 0 100%, 100% 100%, '+((dam_top_width/dam_bottom_width)*100)+'% 0%)');
    
}

