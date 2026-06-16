from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_code_documents(
    files: list[dict[str, str]],
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[dict[str, str]]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    chunks: list[dict[str, str]] = []
    for file_data in files:
        file_path = file_data["file"]
        content = file_data["content"]

        for chunk in splitter.split_text(content):
            chunks.append(
                {
                    "file": file_path,
                    "chunk": chunk,
                }
            )

    return chunks
