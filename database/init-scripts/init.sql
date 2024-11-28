-- 변경 가능
CREATE SCHEMA keepintouch_dev;
SET search_path TO keepintouch_dev;

ALTER DATABASE new_keep SET search_path TO keepintouch_dev;

CREATE SEQUENCE users_user_id_seq
    INCREMENT BY 1
    MINVALUE 1
    AXVALUE 9223372036854775807
    START WITH 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE emotions_emotion_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START WITH 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE questions_question_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START WITH 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE messages_message_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START WITH 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE reaction_templates_reaction_template_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START WITH 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE reactions_reaction_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START WITH 1
    CACHE 1
    NO CYCLE;

-- Users table
CREATE TABLE users (
    user_id bigint NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    email character varying(255) NOT NULL,
    password character varying(255),
    nickname character varying(20) NOT NULL,
    age integer,
    gender character varying(10),
    login_type smallint NOT NULL,
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp(6),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_age_check CHECK ((age >= 0)),
    CONSTRAINT users_email_uq UNIQUE (email)
);

COMMENT ON COLUMN users.login_type IS '가입 수단에 따른 타입 (email=1, google=2, kakao=3)';

-- Questions table
CREATE TABLE questions (
    question_id bigint NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
    user_id bigint NOT NULL,
    is_hidden boolean NOT NULL DEFAULT false,
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp(6),
    content character varying(140) NOT NULL,
    CONSTRAINT questions_pkey PRIMARY KEY (question_id)
);

COMMENT ON TABLE questions IS '질문';

-- Messages table
CREATE TABLE messages (
    message_id bigint NOT NULL DEFAULT nextval('messages_message_id_seq'::regclass),
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    question_id bigint,
    content character varying(200) NOT NULL,
    status smallint NOT NULL DEFAULT 1,
    read_at timestamp(6),
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp(6),
    emotion_id integer,
    CONSTRAINT messages_pkey PRIMARY KEY (message_id)
);

COMMENT ON TABLE messages IS '쪽지. emotion 혹은 question 둘 중 하나만 가질 수 있다.';
COMMENT ON COLUMN messages.status IS '정상, 신고, 숨김 상태 표시 // 1, 2, 3';
COMMENT ON COLUMN messages.read_at IS '쪽지 수신자의 읽은시간';

-- Index
CREATE INDEX messages_created_at_idx ON messages(created_at);

-- Reaction templates table
CREATE TABLE reaction_templates (
    reaction_template_id integer NOT NULL DEFAULT nextval('reaction_templates_reaction_template_id_seq'::regclass),
    emoji character varying(10) NOT NULL,
    type smallint NOT NULL,
    content character varying(50) NOT NULL,
    CONSTRAINT reaction_templates_pkey PRIMARY KEY (reaction_template_id)
);

COMMENT ON COLUMN reaction_templates.type IS '감사, 사과, 응원, 화해';

-- Reactions table
CREATE TABLE reactions (
    reaction_id bigint NOT NULL DEFAULT nextval('reactions_reaction_id_seq'::regclass),
    message_id bigint NOT NULL,
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp(6),
    reaction_template_id integer NOT NULL,
    CONSTRAINT reactions_pkey PRIMARY KEY (reaction_id)
);

-- Message statistics table
CREATE TABLE message_statistics (
    user_id bigint NOT NULL,
    received_message_count integer NOT NULL DEFAULT 0,
    sent_message_count integer NOT NULL DEFAULT 0,
    unread_message_count integer NOT NULL DEFAULT 0,
    unread_reaction_count integer NOT NULL DEFAULT 0,
    CONSTRAINT message_statistics_pkey PRIMARY KEY (user_id),
    CONSTRAINT message_statistics_user_id_uq UNIQUE (user_id)
);

COMMENT ON TABLE message_statistics IS '전체 쪽지, 안읽은 쪽지의 개수를 저장';

-- Emotions table
CREATE TABLE emotions (
    name character varying(50) NOT NULL,
    emoji character varying(10) NOT NULL,
    emotion_id integer NOT NULL DEFAULT nextval('emotions_emotion_id_seq'::regclass),
    CONSTRAINT emotions_pkey PRIMARY KEY (emotion_id)
);

-- Foreign key constraints
ALTER TABLE questions
    ADD CONSTRAINT questions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
    ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT messages_receiver_id_fkey
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT messages_emotion_id_fkey
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id)
    ON DELETE SET NULL;

ALTER TABLE messages
    ADD CONSTRAINT messages_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
    ON DELETE SET NULL;

ALTER TABLE reactions
    ADD CONSTRAINT reactions_message_id_fkey
    FOREIGN KEY (message_id) REFERENCES messages(message_id)
    ON DELETE CASCADE;

ALTER TABLE reactions
    ADD CONSTRAINT reactions_reaction_template_id_fkey
    FOREIGN KEY (reaction_template_id) REFERENCES reaction_templates(reaction_template_id)
    ON DELETE CASCADE;

ALTER TABLE message_statistics
    ADD CONSTRAINT message_statistics_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE;


-- Insert data into reaction_templates
INSERT INTO reaction_templates (emoji, type, content)
VALUES
    ('😊', 1, '고마워'),
    ('🥰', 1, '덕분이야'),
    ('😘', 1, '최고야'),
    ('🥹', 1, '감동이야'),
    ('🤭', 1, '너밖에 없어'),
    ('🥲', 2, '내가 더 잘할게'),
    ('😔', 2, '잘못했어'),
    ('🥹', 2, '죄인이오'),
    ('😭', 2, '반성하는 중'),
    ('🥺', 2, '미안해'),
    ('😎', 3, '화이팅'),
    ('🤩', 3, '멋있어'),
    ('👏', 3, '고생 많았어'),
    ('💪', 3, '응원할게'),
    ('🍀', 3, '행운을 빌어요'),
    ('☺️', 4, '그럴 수 있지'),
    ('🤗', 4, '괜찮아'),
    ('😁', 4, '잘 부탁해'),
    ('😤', 4, '나한테 잘해'),
    ('😉', 4, '한 번만 봐줄게');


-- Insert data into emotions
INSERT INTO emotions (name, emoji)
VALUES
    ('응원과 감사', '🌟'),
    ('솔직한 대화', '🤝');
