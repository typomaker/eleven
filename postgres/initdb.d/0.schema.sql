create extension if not exists "uuid-ossp";

create schema localization;
create table localization.language 
(
    code char(2) primary key not null
);
create table localization.word
(
    name varchar(256) primary key check(name ~ '^[a-z][a-z.]+$')
);
create table localization.translate
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    word     varchar(256) not null references localization.word(name) on delete cascade on update cascade,
    language char(2) not null references localization.language(code) on delete cascade on update cascade,
    value    text
);

create schema card;
create table card.class 
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    name varchar(256) not null references localization.word(name) on delete restrict on update cascade
);
create table card.entity 
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    created timestamp with time zone not null default current_timestamp,
    class uuid references card.class(uuid) default null,
    parent uuid references card.entity(uuid) default null,
    name varchar(256) not null references localization.word(name) on delete restrict on update cascade,
    description varchar(256) default null references localization.word(name) on delete restrict on update cascade,
    image text default null,
    popularity numeric(6,6) default 0 not null ,
    rarity numeric(6,6) default 0 not null 
);
create table card.binder 
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    entity uuid references card.entity(uuid) not null,
    input uuid references card.entity(uuid) not null,
    output uuid references card.entity(uuid) default null
);

create schema deck;
create table deck.entity
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    created timestamp with time zone not null default current_timestamp,
    name varchar(256) default null references localization.word(name) on delete restrict on update cascade
);
create table deck.content
(
    deck uuid not null references deck.entity(uuid) on delete cascade on update cascade,
    card uuid not null references card.entity(uuid) on delete cascade on update cascade,
    position int not null,
    primary key(deck, card)
);

create schema booster;
create table booster.entity
(
    uuid uuid primary key  not null default uuid_generate_v4(),
    created timestamp with time zone not null default current_timestamp,
    name varchar(256) default null references localization.word(name) on delete restrict on update cascade,
    charge smallint not null check (charge > 0)
);
create table booster.content
(
    uuid       uuid primary key not null default uuid_generate_v4(),
    booster uuid not null references booster.entity(uuid) on delete cascade on update cascade,
    card uuid not null references card.entity(uuid) on delete cascade on update cascade,
    chance numeric(6,6) check(chance > 0.0 and chance <= 1.0),
    unique(booster, card)
);

create schema account;
create table account.user
(
    uuid       uuid primary key              not null default uuid_generate_v4(),
    created    timestamp with time zone not null default current_timestamp,
    name       varchar(256)                      default null,
    avatar     text default null,
    deleted    timestamp with time zone default null
);
create table account.email 
(
    uuid     uuid primary key            not null default uuid_generate_v4(),
    address  varchar(256) not null,
    created timestamp with time zone not null default current_timestamp,     
    owner    uuid              not null references account.user(uuid) on delete cascade on update cascade
);

create type account.method as enum('facebook', 'internal');
create table account.sign
(
    method account.method not null,
    key text not null,
    created timestamp with time zone not null default current_timestamp,
    owner uuid default null references account.user(uuid) on delete cascade on update cascade,
    primary key(method, key)
);
create table account.token
(
    uuid       uuid primary key not null default uuid_generate_v4(),
    created timestamp with time zone not null default current_timestamp,
    updated timestamp with time zone not null default current_timestamp,
    deleted timestamp with time zone default null,
    owner    uuid not null references account.user(uuid) on delete cascade on update cascade,
    ip       inet default null
);
create table account.card
(
    uuid       uuid primary key not null default uuid_generate_v4(),
    entity uuid not null references card.entity(uuid)  on delete cascade on update cascade,
    owner uuid not null references account.user(uuid) on delete cascade on update cascade,
    created timestamp with time zone not null default current_timestamp
);
create table account.deck
(
    uuid       uuid primary key not null default uuid_generate_v4(),
    entity uuid not null references deck.entity(uuid)  on delete cascade on update cascade,
    owner uuid not null references account.user(uuid)  on delete cascade on update cascade,
    created timestamp with time zone not null default current_timestamp,
    name text
);
create table account.booster
(
    uuid       uuid primary key not null default uuid_generate_v4(),
    entity uuid not null references booster.entity(uuid)  on delete cascade on update cascade,
    owner uuid not null references account.user(uuid)  on delete cascade on update cascade,
    created timestamp with time zone not null default current_timestamp
);
