package cn.ayeez.blogpojo.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FriendLinkClass {
    private Long id;
    private String className;
    private String classDesc;
    private Integer sort;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
