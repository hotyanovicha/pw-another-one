import { faker } from '@faker-js/faker';
import { pickRandomElement } from '@/utils/random';

export const GENDER_TITLES = ['Mr.', 'Mrs.'] as const;
export type GenderTitle = typeof GENDER_TITLES[number];

export const COUNTRIES = ['United States', 'Canada', 'India', 'Australia', 'New Zealand', 'Israel', 'Singapore'] as const;
export type Country = typeof COUNTRIES[number];

export type Person = {
  title: GenderTitle;

  name: string;
  email: string;
  password: string;

  day: string;
  month: string;
  year: string;

  firstName: string;
  lastName: string;
  company: string;

  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;

  newsletter: boolean;
  offers: boolean;
};

export function createPerson(overrides: Partial<Person> = {}): Person {
  const title = pickRandomElement(GENDER_TITLES);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const password = faker.internet.password({ length: 12 });

  const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const day = String(dob.getDate());
  const month = dob.toLocaleString('en-US', { month: 'long' });
  const year = String(dob.getFullYear());

  const country = pickRandomElement(COUNTRIES);

  const person: Person = {
    title,

    name: firstName,
    email,
    password,

    day,
    month,
    year,

    firstName,
    lastName,
    company: faker.company.name(),

    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country,
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),
    mobile: faker.phone.number({ style: 'international' }),

    newsletter: false,
    offers: false,

    ...overrides,
  };

  return person;
}
