// Example: simple testimonial auto-slider
let slideIndex = 0;
const slides = document.querySelectorAll('.testimonial-slider blockquote');
function showSlide() {
  slides.forEach(s => s.style.display = 'none');
  slides[slideIndex].style.display = 'block';
  slideIndex = (slideIndex + 1) % slides.length;
}
showSlide();
setInterval(showSlide, 5000);
