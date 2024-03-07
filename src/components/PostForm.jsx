import React, { useEffect, useState } from "react";
import {
  ImEye,
  ImFilePicture,
  ImFilesEmpty,
  ImSpinner11,
  ImSpinner3,
} from "react-icons/im";
import { uploadImage } from "../api/post";
import { useNotification } from "../context/NotificationProvider";
import DeviceView from "./DeviceView";
import MarkdownHint from "./MarkdownHint";

export const defaultPost = {
  title: "",
  thumbnail: "",
  featured: "false",
  content: "",
  tags: "",
  meta: "",
};

export default function PostForm({
  initialPost,
  busy,
  postBtnTitle,
  resetAfterSubmit,
  onSubmit,
}) {
  const [postInfo, setPostInfo] = useState({ ...defaultPost });
  const [selectedThumbnailURL, setSelectedThumbnailURL] = useState("");
  const [imageUrlToCopy, setImageUrlToCopy] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [displayMarkdownHint, setDisplayMarkdownHint] = useState(false);
  const [showDeviceView, setShowDeviceView] = useState(false);

  const { updateNotification } = useNotification();

  useEffect(() => {
    if (initialPost) {
      setPostInfo({ ...initialPost });
      setSelectedThumbnailURL(initialPost?.thumbnail);
    }
    return () => {
      if (resetAfterSubmit) resetForm();
    };
  }, [initialPost, resetAfterSubmit]);

  const handleChange = ({ target }) => {
    const { value, name, checked } = target;

    /*Setting conditionals for each post parameter*/

    if (name === "thumbnail") {
      const file = target.files[0];

      if (!file.type?.includes("image")) {
        return alert("This is not an image!");
      }
      setPostInfo({ ...postInfo, thumbnail: file });
      return setSelectedThumbnailURL(URL.createObjectURL(file));
    }

    if (name === "featured") {
      localStorage.setItem(
        "blogPost",
        JSON.stringify({ ...postInfo, featured: checked })
      );
      return setPostInfo({ ...postInfo, [name]: checked });
    }

    if (name === "tags") {
      const newTags = tags.split(",");
      if (newTags.length > 4)
        updateNotification(
          "warning",
          "Only the first four tags will be selected!"
        );
    }

    if (name === "meta" && meta.length >= 150) {
      return setPostInfo({ ...postInfo, meta: value.subString(0, 149) });
    }

    const newPost = { ...postInfo, [name]: value };

    setPostInfo({ ...newPost });

    localStorage.setItem("blogPost", JSON.stringify(newPost));
  };

  /*Function to upload image to cloud storage*/

  const handleImageUpload = async ({ target }) => {
    if (imageUploading) return;

    const file = target.files[0];
    if (!file.type?.includes("image")) {
      return updateNotification("error", "This is not an image!");
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const { error, image } = await uploadImage(formData);
    setImageUploading(false);
    if (error) return updateNotification("error", error);
    setImageUrlToCopy(image);
  };

  /*Function to copy image url*/

  const handleOnCopy = () => {
    const textToCopy = `![Add image description](${imageUrlToCopy})`;
    navigator.clipboard.writeText(textToCopy);
    updateNotification("success", "Copied to Clipboard!");
  };

  /*Function to submit post form*/
  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, content, tags, meta } = postInfo;

    if (!title.trim()) return updateNotification("error", "Title is missing");
    if (!content.trim())
      return updateNotification("error", "Content is missing");
    if (!tags.trim()) return updateNotification("error", "Tags are necessary");
    if (!meta.trim())
      return updateNotification("error", "Please add some meta descriptions!");

    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .filter((item) => item.trim())
      .join("-");

    const newTags = tags
      .split(",")
      .map((item) => item.trim())
      .splice(0, 4);

    const formData = new FormData();
    const finalPost = { ...postInfo, tags: JSON.stringify(newTags), slug };
    for (let key in finalPost) {
      formData.append(key, finalPost[key]);
    }

    onSubmit(formData);
  };

  const resetForm = () => {
    setPostInfo({ ...defaultPost });
    localStorage.removeItem("blogPost");
  };

  const { title, content, featured, tags, meta } = postInfo;

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 flex">
        <div className="w-9/12 space-y-3 flex flex-col h-screen">
          {/*Titled and Submit*/}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-700">
              Create New Post
            </h1>

            <div className="flex items-center space-x-5">
              <button
                onClick={resetForm}
                type="button"
                className="flex items-center space-x-2 px-3 ring-1 ring-blue-500 rounded h-10 text-blue-500 hover:text-white hover:bg-blue-500 transition"
              >
                <ImSpinner11 />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setShowDeviceView(true)}
                type="button"
                className="flex items-center space-x-2 px-3 ring-1 ring-blue-500 rounded h-10 text-blue-500 hover:text-white hover:bg-blue-500 transition"
              >
                <ImEye />
                <span>View</span>
              </button>
              <button className="h-10 w-36 hover:ring-1 bg-blue-500 rounded text-white hover:text-blue-500 hover:bg-transparent ring-blue-500 transition">
                {busy ? (
                  <ImSpinner3 className="animate-spin mx-auto text-xl" />
                ) : (
                  postBtnTitle
                )}
              </button>
            </div>
          </div>
          {/*Featured Check Box*/}
          <div className="flex">
            <input
              id="featured"
              value={featured}
              name="featured"
              type="checkbox"
              hidden
              onChange={handleChange}
            />
            <label
              className="select-none flex items-center space-x-2 text-gray-700 cursor-pointer group"
              htmlFor="featured"
            >
              <div className="w-3 h-3 rounded-full justify-center border border-gray-700 flex group-hover:border-blue-500">
                {featured && (
                  <div className="w-2 h-2 self-center border rounded-full bg-gray-500 group-hover:bg-blue-500" />
                )}
              </div>
              <span className="group-hover:text-blue-500">Featured</span>
            </label>
          </div>

          {/*Title Input*/}
          <input
            value={title}
            name="title"
            onChange={handleChange}
            onFocus={() => setDisplayMarkdownHint(false)}
            type="text"
            placeholder="Post Title"
            className="text-xl outline-none focus:ring-1 rounded p-2 w-full"
          />

          {/*Image Input*/}
          <div className="flex space-x-2">
            <div>
              <input
                onChange={handleImageUpload}
                id="image-input"
                type="file"
                hidden
              />
              <label
                htmlFor="image-input"
                className="flex items-center space-x-2 px-3 ring-1 ring-gray-700 rounded h-10 text-gray-700 hover:text-white hover:bg-gray-700 transition cursor-pointer"
              >
                <span>Place Image</span>
                {!imageUploading ? (
                  <ImFilePicture />
                ) : (
                  <ImSpinner3 className="animate-spin" />
                )}
              </label>
            </div>
            {/*Image Url*/}
            {imageUrlToCopy && (
              <div className="flex flex-1 justify-between rounded overflow-hidden bg-gray-300">
                <input
                  type="text"
                  value={imageUrlToCopy}
                  className="bg-transparent pl-2 w-full"
                  disabled
                />
                <button
                  onClick={handleOnCopy}
                  type="button"
                  className="text-xs flex justify-center flex-col items-center self-stretch bg-gray-500 text-white p-1"
                >
                  <ImFilesEmpty />
                  <span>Copy</span>
                </button>
              </div>
            )}
          </div>

          {/*Markdown*/}
          <textarea
            value={content}
            name="content"
            onChange={handleChange}
            onFocus={() => setDisplayMarkdownHint(true)}
            placeholder="## Markdown"
            className="resize-none outline-none focus:ring-1 rounded p-2 w-full font-semibold flex-1 font-serif tracking-wide text-md"
          ></textarea>

          {/*Tags Input*/}
          <div>
            <label htmlFor="tags" className="text-gray-500">
              Tags
            </label>
            <input
              value={tags}
              name="tags"
              onChange={handleChange}
              type="text"
              id="tags"
              placeholder="Tag one, Tag two"
              className="outline-none focus:ring-1 rounded p-2 w-full"
            />
          </div>

          {/*Meta Description*/}
          <div>
            <label htmlFor="meta" className="text-gray-500">
              Meta Description {meta?.length}/150
            </label>
            <textarea
              value={meta}
              name="meta"
              onChange={handleChange}
              id="meta"
              placeholder="Meta Description"
              className="resize-none outline-none focus:ring-1 rounded p-2 w-full h-28"
            ></textarea>
          </div>
        </div>

        {/*Thumbnail*/}
        <div className="w-1/4 px-4 relative">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">
            Thumbnail
          </h1>
          <div>
            <input
              onChange={handleChange}
              name="thumbnail"
              id="thumbnail"
              type="file"
              hidden
            />
            <label className="cursor-pointer" htmlFor="thumbnail">
              {selectedThumbnailURL ? (
                <img
                  src={selectedThumbnailURL}
                  className="aspect-square shadow-sm rounded"
                  alt=""
                />
              ) : (
                <div className="flex flex-col justify-center items-center border border-dashed border-gray-500 aspect-video text-gray-500">
                  <span>Select thumbnail</span>
                  <span className="text-xs">Recommended Size</span>
                  <span className="text-xs">1280*720</span>
                </div>
              )}
            </label>
          </div>

          {/*General Markdown Rules*/}
          <div className="absolute top-1/2 -translate-y-1/2">
            {displayMarkdownHint && <MarkdownHint />}
          </div>
        </div>
      </form>
      <DeviceView
        title={title}
        content={content}
        thumbnail={selectedThumbnailURL}
        visible={showDeviceView}
        onClose={() => setShowDeviceView(false)}
      />
    </>
  );
}
