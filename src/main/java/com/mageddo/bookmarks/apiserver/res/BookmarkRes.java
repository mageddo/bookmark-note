package com.mageddo.bookmarks.apiserver.res;

import com.mageddo.bookmarks.entity.BookmarkEntity;
import org.springframework.jdbc.core.RowMapper;

public class BookmarkRes {

	private Long id;
	private String name;
	private Integer visibility;
	private String html;
	private Integer length;

	public static RowMapper<BookmarkRes> mapper() {
		return (rs, i) -> {
			return BookmarkRes
				.valueOf(BookmarkEntity.mapper().mapRow(rs, i))
				.setLength(rs.getInt("NUM_QUANTITY"))
			;
		};
	}

	private static BookmarkRes valueOf(BookmarkEntity bookmark) {
		return new BookmarkRes()
			.setHtml(bookmark.getDescription())
			.setId(bookmark.getId())
			.setName(bookmark.getName())
			.setVisibility(bookmark.getVisibility().getCode())
		;
	}

	public Long getId() {
		return id;
	}

	public BookmarkRes setId(Long id) {
		this.id = id;
		return this;
	}

	public String getName() {
		return name;
	}

	public BookmarkRes setName(String name) {
		this.name = name;
		return this;
	}

	public Integer getVisibility() {
		return visibility;
	}

	public BookmarkRes setVisibility(Integer visibility) {
		this.visibility = visibility;
		return this;
	}

	public String getHtml() {
		return html;
	}

	public BookmarkRes setHtml(String html) {
		this.html = html;
		return this;
	}

	public Integer getLength() {
		return length;
	}

	public BookmarkRes setLength(Integer length) {
		this.length = length;
		return this;
	}
}