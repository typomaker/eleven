create extension if not exists "uuid-ossp";
create schema localization;
create table localization.language (id char(2) primary key not null);
create table localization.word (
  id varchar(256) primary key check(id ~ '^[a-z][a-z.]+$')
);
create table localization.translate (
  id uuid primary key not null default uuid_generate_v4(),
  word varchar(256) not null references localization.word(id) on delete cascade on update cascade,
  language char(2) not null references localization.language(id) on delete cascade on update cascade,
  value text
);
create schema rbac;
create table rbac.operation (
  id varchar(256) primary key check(id ~ '^[a-z][a-z.]+$')
);
create table rbac.hierarchy (
  parent varchar(256) not null references rbac.operation(id),
  child varchar(256) not null references rbac.operation(id),
  primary key(parent, child)
);
create schema card;
create table card.type (
  id varchar(256) primary key check(id ~ '^[a-z][a-z.]+$')
);
create table card.card (
  id uuid primary key not null default uuid_generate_v4(),
  type varchar(256) not null references card.type(id) on delete restrict on update cascade,
  name varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp,
  image text default null,
);
create table card.behavior (
  id uuid primary key not null default uuid_generate_v4(),
  card uuid not null references card.card(id) on delete cascade on update cascade,
  source uuid not null references card.card(id) on delete cascade on update cascade,
);
create table card.combination (
  id uuid primary key not null default uuid_generate_v4(),
  card uuid not null references card.card(id) on delete cascade on update cascade,
  input uuid not null references card.card(id) on delete cascade on update cascade,
  output uuid not null references card.card(id) on delete cascade on update cascade,
  unique(card, input, output)
);
create schema deck;
create table deck.deck (
  id uuid primary key not null default uuid_generate_v4(),
  created timestamp with time zone not null default current_timestamp,
  name varchar(256) default null references localization.word(id) on delete restrict on update cascade
);
create table deck.element (
  deck uuid not null references deck.deck(id) on delete cascade on update cascade,
  card uuid not null references card.card(id) on delete cascade on update cascade,
  position int not null check(position >= 0),
  primary key(deck, card)
);
create schema booster;
create table booster.booster (
  id uuid primary key not null default uuid_generate_v4(),
  created timestamp with time zone not null default current_timestamp,
  name varchar(256) default null references localization.word(id) on delete restrict on update cascade,
  charge smallint not null check (charge > 0)
);
create table booster.element (
  id uuid primary key not null default uuid_generate_v4(),
  booster uuid not null references booster.booster(id) on delete cascade on update cascade,
  card uuid not null references card.card(id) on delete cascade on update cascade,
  probability numeric(7, 6) check(
    probability > 0
    and probability <= 1
  ),
  unique(booster, card),
  unique(booster, probability)
);
create schema account;
create table account.account (
  id uuid primary key not null default uuid_generate_v4(),
  created timestamp with time zone not null default current_timestamp,
  name varchar(256) default null,
  avatar text default null,
  deleted timestamp with time zone default null
);
create table account.email (
  id uuid primary key not null default uuid_generate_v4(),
  address varchar(256) not null,
  confirmed timestamp with time zone default null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  owner uuid not null references account.account(id) on delete cascade on update cascade
);
create type account.sign_kind as enum('facebook', 'password');
create table account.sign (
  kind account.sign_kind not null,
  data text not null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  owner uuid default null references account.account(id) on delete cascade on update cascade,
  primary key(type, data)
);
create table account.token (
  id uuid primary key not null default uuid_generate_v4(),
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  expired timestamp with time zone default null,
  owner uuid not null references account.account(id) on delete cascade on update cascade,
  ip inet default null,
  sign uuid default null references account.sign(id) on delete cascade on update cascade
);
create table account.card (
  id uuid primary key not null default uuid_generate_v4(),
  instance uuid not null references card.card(id) on delete cascade on update cascade,
  owner uuid not null references account.account(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  quantity int not null default 1 check (quantity >= 1)
);
create table account.deck (
  id uuid primary key not null default uuid_generate_v4(),
  instance uuid not null references deck.deck(id) on delete cascade on update cascade,
  owner uuid not null references account.account(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  name text
);
create table account.booster (
  id uuid primary key not null default uuid_generate_v4(),
  instance uuid not null references booster.booster(id) on delete cascade on update cascade,
  owner uuid not null references account.account(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp
);