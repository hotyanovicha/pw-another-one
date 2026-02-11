import { Person } from './person.factory';
import { RegistrationFormData } from '@/ui/models/registration-form.model';

export function createRegistrationFormData(person: Person): RegistrationFormData {
	return {
		name: person.name,
		email: person.email,
		password: person.password,
		title: person.title,
		birth_date: person.day,
		birth_month: person.month,
		birth_year: person.year,
		firstname: person.firstName,
		lastname: person.lastName,
		company: person.company,
		address1: person.address1,
		address2: person.address2,
		country: person.country,
		zipcode: person.zipcode,
		state: person.state,
		city: person.city,
		mobile_number: person.mobile,
	};
}
