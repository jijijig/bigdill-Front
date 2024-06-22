/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: {
    container: [
      [{ size: ["small", false, "large", "huge"] }],
      [{ align: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  },
};

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "align",
  "size",
];

export default function EditPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/boards/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTitle(response.data.title);
          setContent(response.data.content);
        } catch (error) {
          console.error("Failed to fetch post", error);
          setError("Failed to fetch post");
        }
      };

      fetchPost();
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPost = {
      title,
      content,
    };

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/boards/${id}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 헤더에 토큰을 추가합니다.
            "Content-Type": "application/json", // JSON 요청임을 명시합니다.
          },
        }
      );
      console.log("게시글 수정 성공:", response.data);
      router.push(`/posts/${id}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      setError("게시글 수정 실패");
    }
  };

  return (
    <div css={styles}>
      <form onSubmit={handleSubmit} className="post-form">
        <h1>게시글 수정</h1>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">내용</label>
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={content}
            onChange={(value: React.SetStateAction<string>) =>
              setContent(value)
            }
          />
        </div>

        <button className="submit" type="submit">
          게시글 수정
        </button>
      </form>
    </div>
  );
}

const styles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .post-form {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h1 {
      margin-bottom: 20px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }

      input,
      .ql-container {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .ql-container {
        height: 300px;
        .ql-editor {
          height: 250px;
          overflow-y: auto;
          color: black; /* 기본 텍스트 색상을 검정색으로 설정 */
        }
      }
    }

    .submit {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      background-color: #995dff;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;

      &:hover {
        background-color: #a775ff;
      }
    }

    .error {
      color: red;
      margin-bottom: 20px;
      text-align: center;
    }

    .ql-toolbar {
      .ql-header[value="1"]::before {
        content: "H1";
        color: black;
      }
      .ql-header[value="2"]::before {
        content: "H2";
        color: black;
      }
      .ql-header[value="1"],
      .ql-header[value="2"] {
        background-color: white;
        color: black;
      }
    }
  }
`;
