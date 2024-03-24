var $ = require( "jquery" );
//IBG  // Also include in SCSS
import ibg from './libs/ibg.js'
import 'slick-carousel'
$(document).ready(function(){
	ibg();
})

//MODAL  // Also include in SCSS
import './libs/modal.js';
import {CloseModal, OpenModal} from './libs/modal.js';

$(document).on("click","[data-click-class-toggler]", function(){
	let group = $(this).closest("[data-click-class-toggle]");
	group.toggleClass($(this).data("click-class-toggler"));
});
$(document).on("click","[data-click-selectable]", function(){
	let group = $(this).closest("[data-click-selectables]");
	let elems = group.find("[data-click-selectable]");
	let cssClass = group.data("click-selectables");
	for(let elem of elems){
		$(elem).removeClass(cssClass);
	}
	$(this).addClass(cssClass);
});


$(document).on("click",".burger", function(){
	$("#mob-menu").toggleClass('active');
	$(this).toggleClass('active');
	let state = !($("body").attr("locked") === 'true');
	$("body").attr("locked", state);
	$("body").css("overflow", state ? "hidden": "auto");
});
$(document).on("click","[data-sidebar-arrow]", function(){
	$("[data-sidebar]").toggleClass('active');
});
$(document).ready(function(){
	$(".image-slider-modal").slick({
		dots:false,
		slidesToShow: 1,
		slidesToScroll: 1,

		arrows: true,
		adaptiveHeight: true,
        prevArrow:`<div class='z-10 cursor-pointer absolute left-0.5 h-full m-auto flex justify-center items-center'>
	        <div class="bg-black/50 rounded-full w-8 h-8 flex justify-center items-center text-white text-xl">
	        	<i class='fa-solid fa-angle-left'></i>

	        </div>
        </div>`,
        nextArrow:`<div class='z-10 cursor-pointer absolute right-0.5 h-full m-auto flex justify-center items-center'>
	        <div class="bg-black/50 rounded-full w-8 h-8 flex justify-center items-center text-white text-xl">
	        	<i class='fa-solid fa-angle-right'></i>

	        </div>
        </div>`,
	});

	$(".review-slider").slick({
		dots:false,
		slidesToShow: 2,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 992,
				settings: {
					slidesToShow: 1,
				}
		    }
	    ],
		arrows: true,
		adaptiveHeight: true,
        prevArrow:`<div class='z-10 cursor-pointer absolute left-0.5 h-full m-auto flex justify-center items-center'>
	        <div class="bg-black/50 rounded-full w-8 h-8 flex justify-center items-center text-white text-xl">
	        	<i class='fa-solid fa-angle-left'></i>

	        </div>
        </div>`,
        nextArrow:`<div class='z-10 cursor-pointer absolute right-0.5 h-full m-auto flex justify-center items-center'>
	        <div class="bg-black/50 rounded-full w-8 h-8 flex justify-center items-center text-white text-xl">
	        	<i class='fa-solid fa-angle-right'></i>

	        </div>
        </div>`,
	});
	$(".image-preview-slider").each(function(){
		let main = $(this).find(".image-preview-slider-main")[0];
		let nav = $(this).find(".image-preview-slider-nav")[0];
		$(main).slick({
			dots:false,
			arrows:false,
			slidesToShow: 1,
			slidesToScroll: 1,
			asNavFor: nav,
			responsive: [
				{
					breakpoint: 762,
					settings: {
						arrows: true,
					}
				}
			],
			adaptiveHeight: true,
	        prevArrow:`<div class='z-10 cursor-pointer absolute left-0.5 h-full m-auto flex justify-center items-center'>
		        <div class="bg-black/50 rounded-full w-5 h-5 flex justify-center items-center text-white text-base">
		        	<i class='fa-solid fa-angle-left'></i>

		        </div>
	        </div>`,
	        nextArrow:`<div class='z-10 cursor-pointer absolute right-0.5 h-full m-auto flex justify-center items-center'>
		        <div class="bg-black/50 rounded-full w-5 h-5 flex justify-center items-center text-white text-base">
		        	<i class='fa-solid fa-angle-right'></i>

		        </div>
	        </div>`,
		});
		$(nav).slick({
			dots:false,
			slidesToShow: 5,
			slidesToScroll: 1,
			arrows: true,
			responsive: [
				{
					breakpoint: 992,
					settings: {
						slidesToShow: 3,
					}
			    }
		    ],
	        prevArrow:`<div class='z-10 cursor-pointer absolute left-0.5 h-full m-auto flex justify-center items-center'>
		        <div class="bg-black/50 rounded-full w-5 h-5 flex justify-center items-center text-white text-base">
		        	<i class='fa-solid fa-angle-left'></i>

		        </div>
	        </div>`,
	        nextArrow:`<div class='z-10 cursor-pointer absolute right-0.5 h-full m-auto flex justify-center items-center'>
		        <div class="bg-black/50 rounded-full w-5 h-5 flex justify-center items-center text-white text-base">
		        	<i class='fa-solid fa-angle-right'></i>

		        </div>
	        </div>`,
	        
			asNavFor: main,
		});
	});
	
});
function LoadApartmentSlider(){
	$(".apartment-image-slider").each(function(slider){
		let prev = $(this).siblings("[slider-left-arrow]");
		let next = $(this).siblings("[slider-right-arrow]");
		$(this).slick({
			prevArrow: prev,
			nextArrow: next,
		});
	});
}
$(document).ready(function(){
	LoadApartmentSlider();
});
window.restartSliders = function(){
	LoadApartmentSlider();
}