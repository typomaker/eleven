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

create schema equipment;
create table equipment.card (
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp,
  quality int default null
);
create table equipment.card_behavior(
  id uuid primary key not null default uuid_generate_v4(),
  card uuid not null references equipment.card(id) on delete cascade on update cascade,
  source uuid not null references equipment.card(id) on delete restrict on update cascade,
  unique (card, source)
);
create table equipment.card_combination (
  id uuid primary key not null default uuid_generate_v4(),
  card uuid not null references card.card(id) on delete cascade on update cascade,
  input uuid not null references card.card(id) on delete restrict on update cascade,
  output uuid not null references card.card(id) on delete restrict on update cascade,
  unique(card, input, output)
);
create table equipment.deck (
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) default null references localization.word(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp
);
create table equipment.deck_card (
  id uuid primary key not null default uuid_generate_v4(),
  deck uuid not null references equipment.deck(id) on delete cascade on update cascade,
  card uuid not null references equipment.card(id) on delete cascade on update cascade,
  position int not null check(position >= 0),
  unique(deck, card)
);
create table equipment.booster (
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) default null references localization.word(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp,
  size smallint not null check (size > 0),
  enumerator int not null default 1,
);
create table equipment.booster_card (
  id uuid primary key not null default uuid_generate_v4(),
  booster uuid not null references equipment.booster(id) on delete cascade on update cascade,
  card uuid not null references card.card(id) on delete cascade on update cascade,
  frequency int not null check (frequency > 0),
  unique(booster, card)
);

create schema activity;
create table activity.event (
  id uuid primary key not null default uuid_generate_v4(),
);

create schema account;
create table account.user (
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
  owner uuid not null references account.user(id) on delete cascade on update cascade
);
create type account.sign_type as enum('facebook', 'password');
create table account.sign (
  id uuid primary key not null default uuid_generate_v4(),
  type account.sign_type not null,
  data text not null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  owner uuid default null references account.user(id) on delete cascade on update cascade
);
create table account.token (
  id uuid primary key not null default uuid_generate_v4(),
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  expired timestamp with time zone default null,
  owner uuid not null references account.user(id) on delete cascade on update cascade,
  ip inet default null,
  sign uuid default null references account.sign(id) on delete cascade on update cascade
);
create table account.card (
  id uuid primary key not null default uuid_generate_v4(),
  source uuid not null references equipment.card(id) on delete restrict on update cascade,
  owner uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  wear int default null
);
create table account.deck (
  id uuid primary key not null default uuid_generate_v4(),
  source uuid not null references equipment.deck(id) on delete restrict on update cascade,
  owner uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp
);
create table account.booster (
  id uuid primary key not null default uuid_generate_v4(),
  source uuid not null references equipment.booster(id) on delete restrict on update cascade,
  owner uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp
);