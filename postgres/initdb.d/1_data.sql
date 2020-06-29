--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

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

--
-- Data for Name: user; Type: TABLE DATA; Schema: account; Owner: eleven
--

COPY account."user" (id, name, avatar, created, deleted) FROM stdin;
\.


--
-- Data for Name: email; Type: TABLE DATA; Schema: account; Owner: eleven
--

COPY account.email (id, address, confirmed, "user", created, deleted) FROM stdin;
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: account; Owner: eleven
--

COPY account.permission ("user", item, space) FROM stdin;
\.


--
-- Data for Name: sign; Type: TABLE DATA; Schema: account; Owner: eleven
--

COPY account.sign (id, type, data, "user", created, deleted) FROM stdin;
\.


--
-- Data for Name: token; Type: TABLE DATA; Schema: account; Owner: eleven
--

COPY account.token (id, "user", ip, sign, created, deleted, expired) FROM stdin;
\.


--
-- Data for Name: language; Type: TABLE DATA; Schema: localization; Owner: eleven
--

COPY localization.language (id) FROM stdin;
\.


--
-- Data for Name: word; Type: TABLE DATA; Schema: localization; Owner: eleven
--

COPY localization.word (id) FROM stdin;
\.


--
-- Data for Name: translate; Type: TABLE DATA; Schema: localization; Owner: eleven
--

COPY localization.translate (language, word, value) FROM stdin;
\.


--
-- Data for Name: label; Type: TABLE DATA; Schema: object; Owner: eleven
--

COPY object.label (id) FROM stdin;
character
gateway
location
slot
place
transition
\.


--
-- Data for Name: node; Type: TABLE DATA; Schema: object; Owner: eleven
--

COPY object.node (id, label, property, created, deleted) FROM stdin;
c434fd03-586f-4b59-bc9e-893d6ea5bce5	character	{"name": null, "rank": 0.0, "experience": 0.0}	2020-06-29 20:55:55.353451+00	\N
d0fb8673-9ee1-4180-a39a-289dc27d4667	place	{"name": "Earth"}	2020-06-29 21:04:52.057122+00	\N
2e2a0987-abf9-4dbc-b423-ec84d62ee33d	place	{"name": "Mainport"}	2020-06-29 21:08:38.366606+00	\N
c1f4364c-4aa6-4407-8add-e8db8df44156	transition	\N	2020-06-29 21:11:36.321636+00	\N
\.


--
-- Data for Name: edge; Type: TABLE DATA; Schema: object; Owner: eleven
--

COPY object.edge (id, label, property, "from", "to") FROM stdin;
ee04a930-aee9-4eab-9c6d-7ddaa36bd7c7	location	\N	c434fd03-586f-4b59-bc9e-893d6ea5bce5	d0fb8673-9ee1-4180-a39a-289dc27d4667
59d787af-225a-4bed-842b-ff88e64f968c	gateway	\N	d0fb8673-9ee1-4180-a39a-289dc27d4667	2e2a0987-abf9-4dbc-b423-ec84d62ee33d
\.


--
-- PostgreSQL database dump complete
--

