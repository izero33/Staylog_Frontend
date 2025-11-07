import { useState } from 'react';
import QuillEditor from '../components/QuillEditor'; // QuillEditor 컴포넌트를 import 합니다.

/**
 * QuillEditor 컴포넌트를 테스트하기 위한 전용 페이지입니다.
 */
export default function TestEditorPage() {
  // 1. 에디터의 HTML 내용을 저장하기 위한 React 상태(state)를 생성합니다.
  //    초기값은 빈 문자열입니다.
  const [content, setContent] = useState('');

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Quill Editor 테스트 페이지</h1>

      {/* 2. QuillEditor 컴포넌트를 렌더링합니다. */}
      {/*    - value: 현재 에디터의 내용을 props로 전달합니다. */}
      {/*    - onChange: 에디터 내용이 변경될 때마다 setContent 함수를 호출하여 상태를 업데이트합니다. */}
      <QuillEditor value={content} onChange={setContent} />

      <hr className="my-5" />

      {/* 3. 에디터의 현재 HTML 내용(state)을 실시간으로 확인하기 위한 출력 영역입니다. */}
      <div>
        <h2>실시간 HTML 출력</h2>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginTop: '10px',
            minHeight: '150px',
            backgroundColor: '#f8f9fa',
            whiteSpace: 'pre-wrap', // HTML 태그가 그대로 보이도록 설정
            wordBreak: 'break-all',
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
