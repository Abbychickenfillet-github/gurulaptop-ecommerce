CREATE TABLE event_type (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_platform VARCHAR(20) NOT NULL,
    event_content TEXT NOT NULL,
    event_rule TEXT NOT NULL,
    event_award TEXT NOT NULL,
    individual_or_team VARCHAR(10) NOT NULL DEFAULT '個人',
    event_picture VARCHAR(255) NOT NULL,
    apply_start_time TIMESTAMP NOT NULL,
    apply_end_time TIMESTAMP NOT NULL,
    event_start_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP NOT NULL,
    maximum_people INTEGER NOT NULL,
    status_id INTEGER DEFAULT 1,
    valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    current_participants INTEGER DEFAULT 0,
    CHECK (individual_or_team IN ('個人', '團體'))
);
INSERT INTO event_type (event_id, event_name, event_type, event_platform, event_content, event_rule, event_award, individual_or_team, event_picture, apply_start_time, apply_end_time, event_start_time, event_end_time, maximum_people, status_id, valid, created_at, current_participants) VALUES
(1, 'APEX - INTOVOID娛樂賽', 'Apex Legends', 'PC', 'INTOVOID娛樂賽 SDLP Community主辦的第四届娛樂賽,開放給各位玩家報名', '1. 需按時完成報到\n2. 禁止使用任何外掛或輔助工具\n3. 遵守遊戲官方規則\n4. 禁止隊伍間共謀行為\n5. 直播延遲需設定2分鐘', '冠軍：新台幣30,000元 + 獎盃\n亞軍：新台幣15,000元\n季軍：新台幣10,000元\nMVP：新台幣5,000元', '團體', 'https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/13962/banner_image.png?cf0PXmkEIHXBnOSL_mgr2A==', '2024-11-13 00:00:00', '2024-11-28 00:00:00', '2024-12-28 00:00:00', '2025-01-02 00:00:00', 60, 1, TRUE, NOW(), 33);
COMMENT ON TABLE event_type IS '比賽類型設定';
COMMENT ON COLUMN event_type.individual_or_team IS '比賽類型：個人或團體賽';