create extension if not exists "uuid-ossp";

create schema localization;

create table localization.language(id char(2) primary key not null);
create table localization.word(
  id varchar(256) primary key not null check(id ~ '^[a-z][a-z0-9.]+$')
);
create table localization.translate(
  language char(2) not null references localization.language(id) on delete restrict on update cascade,
  word varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  value text,
  primary key(language, word)
);

create schema account;

create table account.user(
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) default null,
  avatar text default null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table account.email(
  id uuid primary key not null default uuid_generate_v4(),
  address varchar(256) not null,
  confirmed timestamp with time zone default null,
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create type account.sign_type as enum('facebook', 'password');
create table account.sign(
  id uuid primary key not null default uuid_generate_v4(),
  type account.sign_type not null,
  data text not null,
  "user" uuid default null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table account.token(
  id uuid primary key not null default uuid_generate_v4(),
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  ip inet default null,
  sign uuid default null references account.sign(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  expired timestamp with time zone default null
);

create schema equipment;

create table equipment.item(
  id uuid primary key not null default uuid_generate_v4(),
  origin uuid default null references equipment.item(id) on delete cascade on update cascade,
  name varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create index on equipment.item(created);
create index on equipment.item(deleted);

create table equipment.inheritance(
  id uuid primary key not null default uuid_generate_v4(),
  parent uuid not null references equipment.item(id) on delete restrict on update cascade,
  child uuid not null references equipment.item(id) on delete cascade on update cascade,
  unique(parent, child)
);
create table equipment.combination(
  id uuid primary key not null default uuid_generate_v4(),
  item uuid not null references equipment.item(id) on delete cascade on update cascade,
  input uuid not null references equipment.item(id) on delete restrict on update cascade,
  output uuid not null references equipment.item(id) on delete restrict on update cascade,
  is_basic boolean not null default false,
  unique(item, input, output)
);
create table equipment.slot(
  id uuid primary key not null default uuid_generate_v4(),
  origin uuid default null references equipment.slot(id) on delete cascade on update cascade,
  item uuid not null references equipment.item(id) on delete cascade on update cascade,
  parent uuid default null references equipment.item(id) on delete restrict on update cascade,
  content uuid default null references equipment.item(id) on delete restrict on update cascade
);

create schema activity;

create table activity.story(
  id uuid primary key not null default uuid_generate_v4(),
  environment uuid not null references equipment.item(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create index on activity.story(created);
create index on activity.story(deleted);

create table activity.event(
  id uuid primary key not null default uuid_generate_v4(),
  story uuid not null references activity.story(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create index on activity.event(created);
create index on activity.event(deleted);

create table activity.member(
  id uuid primary key not null default uuid_generate_v4(),
  event uuid not null references activity.event(id) on delete cascade on update cascade,
  item uuid not null references equipment.item(id) on delete restrict on update cascade,
  priority smallint not null check(priority >= 0)
);

create table activity.turn(
  id uuid primary key not null default uuid_generate_v4(),
  event uuid not null references activity.event(id) on delete cascade on update cascade,
  member uuid not null references activity.member(id) on delete cascade on update cascade,
  target uuid not null references equipment.item(id) on delete restrict on update cascade,
  from uuid not null references equipment.item(id) on delete restrict on update cascade,
  to uuid not null references equipment.item(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp
);
create index on activity.turn(created);

create table activity.reward(
  id uuid primary key not null default uuid_generate_v4(),
  story uuid not null references activity.story(id) on delete cascade on update cascade,
  item uuid not null references equipment.item(id) on delete restrict on update cascade,
  droprate int not null check(droprate > 0)
);

create table activity.winner(
  id uuid primary key not null default uuid_generate_v4(),
  event uuid not null references activity.event(id) on delete cascade on update cascade,
  member uuid not null references activity.member(id) on delete restrict on update cascade,
  reward uuid not null references activity.reward(id) on delete restrict on update cascade,
  created timestamp with time zone not null default current_timestamp
);
create index on activity.winner(created);