SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

SET default_tablespace = '';

SET default_table_access_method = heap;


--
CREATE FUNCTION public.fn_trig_shedule_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        new.id = (SELECT count(*) + 1 from shedule);
        return new;
    END;
$$;

ALTER FUNCTION public.fn_trig_shedule_id() OWNER TO misha;


--
CREATE FUNCTION public.fn_shedule_auditorium() RETURNS trigger
	LANGUAGE plpgsql
	AS $$
	BEGIN
		new.auditorium = (select auditorium from subject where subjectname = new.subjectname);
		return new;
	END;
$$;

ALTER FUNCTION public.fn_shedule_auditorium() OWNER TO misha;


--
CREATE TABLE public.users (
    username character varying(40) NOT NULL,
    emailid character varying(100) NOT NULL,
    password_hash character varying(100) NOT NULL,
    chief boolean NOT NULL
);

ALTER TABLE public.users OWNER TO misha;

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_emailid UNIQUE (emailid);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (usernamee);

ALTER TABLE ONLY public.users 
    ADD CONSTRAINT users_pkey PRIMARY KEY (emailid);


--
CREATE TABLE public.teachers (
    teacherfio character varying(40) NOT NULL,
    academic_degree character varying(100) NOT NULL, -- Ученая степень
    category character varying(100) NOT NULL, -- Ученое звание
    post character varying(100) NOT NULL -- Должность
);

ALTER TABLE public.teachers OWNER TO misha;

ALTER TABLE ONLY public.teachers 
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (teacherfio);


--
CREATE TABLE public.groups (
    groupname character varying(10) NOT NULL,
    direction character varying(50) NOT NULL,
    people_count integer NOT NULL
);

ALTER TABLE public.groups OWNER TO misha;

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT unique_groupname UNIQUE (groupname);

ALTER TABLE ONLY public.groups 
    ADD CONSTRAINT groups_pkey PRIMARY KEY (groupname);


--
CREATE TABLE public.subjects (
    subjectname character varying(80) NOT NULL,
    auditorium character varying(10) NOT NULL
);

ALTER TABLE public.subjects OWNER TO misha;

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT unique_subjectname UNIQUE (subjectname);

ALTER TABLE ONLY public.subjects 
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subjectname);


--
CREATE TABLE public.formats (
    formatsubject character varying(10) NOT NULL
);

ALTER TABLE public.formats OWNER TO misha;

ALTER TABLE ONLY public.formats
    ADD CONSTRAINT unique_format UNIQUE (formatsubject);

ALTER TABLE ONLY public.formats 
    ADD CONSTRAINT formats_pkey PRIMARY KEY (formatsubject);


--
CREATE TABLE public.shedule (
    id bigint NOT NULL,
    subjectname character varying(80),
    formatsubject character varying(10),
    teacher character varying(40),
    groupname character varying(10),
    numberpair integer NOT NULL,
    date_subject date NOT NULL
);

ALTER TABLE public.shedule OWNER TO misha;

ALTER TABLE ONLY public.shedule 
    ADD CONSTRAINT shedule_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.shedule 
    ADD CONSTRAINT shedule_subjectname_fkey FOREIGN KEY (subjectname)  REFERENCES public.subjects (subjectname);

ALTER TABLE ONLY public.shedule 
    ADD CONSTRAINT shedule_formatsubject_fkey FOREIGN KEY (formatsubject)  REFERENCES public.formats (formatsubject);

ALTER TABLE ONLY public.shedule 
    ADD CONSTRAINT shedule_teacher_fkey FOREIGN KEY (teacher)  REFERENCES public.teachers (teacherfio);

ALTER TABLE ONLY public.shedule 
    ADD CONSTRAINT shedule_fstudygroup_fkey FOREIGN KEY (groupname)  REFERENCES public.groups (groupname);


CREATE TRIGGER trig_shedule_id BEFORE INSERT ON public.shedule 
    FOR EACH ROW EXECUTE FUNCTION public.fn_trig_shedule_id();

CREATE TRIGGER trig_shedule_auditorium BEFORE INSERT ON public.shedule
	FOR EACH ROW EXECUTE FUNCTION public.fn_shedule_auditorium();
