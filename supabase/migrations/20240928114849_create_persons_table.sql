CREATE TABLE public.persons (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    maiden_name VARCHAR(255),
    mother_id INTEGER REFERENCES public.persons(id),
    father_id INTEGER REFERENCES public.persons(id),
    born_at DATE NOT NULL,
    died_at DATE
);