import { fetchMovieAvailability, fetchMovieList } from "./api.js"

let selected_movie = "";
let selected_seats = [];

const main = document.getElementById("container");
const booker_div = document.getElementById('booker');
const booker_grid_holder = document.getElementById('booker-grid-holder');
const book_tkt_btn = document.getElementById("book-ticket-btn");

main.innerHTML = "<div id='loader'>Loading...</div>";

fetchMovieList().then(data => {
	const movie_holder = document.createElement("div")
	movie_holder.className = "movie-holder";
	data.forEach(movie => {
		const movie_anchor = document.createElement("a");
		movie_anchor.classList.add("movie-link");
		movie_anchor.href = "/" + movie.name;

		const movie_div = document.createElement("div");
		movie_div.classList.add("movie");
		movie_div.setAttribute("data-d", movie.name);

		const movie_img_wrapper = document.createElement("div");
		movie_img_wrapper.classList.add("movie-img-wrapper");
		movie_img_wrapper.style.backgroundImage = `url(${movie.imgUrl})`;

		const movie_heading = document.createElement("h4");
		movie_heading.innerHTML = movie.name;

		movie_div.replaceChildren(movie_img_wrapper, movie_heading);

		movie_anchor.addEventListener("click", movie_anchor_handler(movie.name));

		movie_anchor.appendChild(movie_div);
		movie_holder.appendChild(movie_anchor);
	});
	main.replaceChildren(movie_holder);
})

const movie_anchor_handler = (movie_name) => (event) => {
	event.preventDefault();
	const booker_h3 = document.querySelector('#booker>h3');
	selected_seats = []; // every time a movie tile is clicked, reset seat selection
	if (movie_name === selected_movie) {
		selected_movie = "";
		booker_h3.classList.add("v-none");
		booker_grid_holder.innerHTML = "";
	} else {
		booker_h3.classList.remove("v-none");
		selected_movie = movie_name;
		booker_grid_holder.innerHTML = "Loading...";
		fetchMovieAvailability(movie_name).then(movie_availability_handler);
	}
}

const movie_availability_handler = data => {
	// console.log(data);
	const left_grid = document.createElement("div");
	const right_grid = document.createElement("div");
	[left_grid, right_grid].forEach((grid, grid_index) => {
		grid.classList.add("booking-grid");

		// TODO: it could have been much better to just use a 'grid' display instead of flexbox here
		for (let i = 0; i < 3; i++) {
			const row = document.createElement("div");
			row.className = "booking-grid-row";
			for (let j = 0; j < 4; j++) {
				const grid_number = (grid_index * 12) + (i * 4) + (j) + 1;
				const cell = document.createElement("div");
				cell.id = `booking-grid-${grid_number}`;
				cell.innerHTML = grid_number;

				const isAvailable = data.includes(grid_number);
				cell.className = (isAvailable) ? "available-seat" : "unavailable-seat";

				if (isAvailable) {
					cell.addEventListener("click", () => {
						cell.classList.toggle("selected-seat");
						const seat_index = selected_seats.indexOf(grid_number);
						if (seat_index == -1) {
							selected_seats.push(grid_number);
						} else {
							selected_seats = selected_seats.slice(0, seat_index).concat(selected_seats.slice(seat_index + 1, selected_seats.length));
						}
						console.debug(`seat clicked ${grid_number}: index: ${seat_index}, new selected_array: ${selected_seats.toString()}`);
						set_book_ticket_btn_visibility();
					})
				}
				cell.classList.add("booking-grid-cell");
				row.appendChild(cell);
			}
			grid.appendChild(row);
		}
	})
	booker_grid_holder.replaceChildren(left_grid, right_grid);
}

const set_book_ticket_btn_visibility = () => {
	if (selected_seats.length > 0) {
		book_tkt_btn.classList.remove("v-none");
	} else {
		book_tkt_btn.classList.add("v-none");
	}
}

book_tkt_btn.addEventListener('click', () => {
	const confirm_purchase_div = document.createElement("div");
	confirm_purchase_div.id = "confirm-purchase";

	const cp_heading = document.createElement('h3');
	cp_heading.innerHTML = `Confirm your booking for seat numbers:${selected_seats.join(", ")}`;
	confirm_purchase_div.appendChild(cp_heading);

	const cp_form = document.createElement('form');
	cp_form.id = "customer-detail-form";
	const email_label = document.createElement('label');
	email_label.innerHTML = "Email";
	email_label.setAttribute('for', 'email');
	const email_input = document.createElement('input');
	email_input.id = 'email';
	email_input.type = 'email';
	email_input.name = 'email_id';
	email_input.required = true;
	const phone_label = document.createElement('label');
	phone_label.innerHTML = "Phone number";
	phone_label.setAttribute('for', 'phone');
	const phone_input = document.createElement('input');
	phone_input.id = 'phone';
	phone_input.name = 'phone_number';
	phone_input.type = 'tel';
	phone_input.required = true;
	const submit_input = document.createElement('input');
	submit_input.type = "submit";

	[email_label, email_input, phone_label, phone_input, submit_input].forEach(element => {
		cp_form.appendChild(element);
	})

	cp_form.addEventListener('formdata', confirm_purchase_handler);

	confirm_purchase_div.appendChild(cp_form);
	booker_div.replaceChildren(confirm_purchase_div);
})

function confirm_purchase_handler(event) {
	event.preventDefault();
	const successFormData = event.formData;

	const success_div = document.createElement('div');
	success_div.id = 'Success';

	const success_h3 = document.createElement('h3');
	success_h3.innerHTML = "Booking details";
	const success_seats = document.createTextNode(`Seats: ${selected_seats.join(", ")}`);
	const br_element_1 = document.createElement('br');
	const success_phone = document.createTextNode(`Phone number: ${successFormData.get('phone_number')}`);
	const br_element_2 = document.createElement('br');
	const success_email = document.createTextNode(`Email: ${successFormData.get('email_id')}`);
	[success_h3, success_seats, br_element_1, success_phone, br_element_2, success_email].forEach(el => {
		success_div.appendChild(el);
	})

	booker_div.replaceChildren(success_div);
}