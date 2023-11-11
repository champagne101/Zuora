import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import postsabi from '../../contracts/posts.json';

const contractAddress = '0x36e4C7EE06DBa016D613dF6F9eeC0fD350639177'; // 0x0a23E002358F591C928af6f0001108002aeb2611   0x36e4C7EE06DBa016D613dF6F9eeC0fD350639177
const contractABI = postsabi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

function Posts() {
  const [newCid, setNewCid] = useState('');
  const [posts, setPosts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedPost, setSelectedPost] = useState(0);

  useEffect(() => {
    // Load existing posts
    async function loadPosts() {
      const currentEntry = await contract.currentEntry();
      const posts = [];

      for (let i = 1; i <= currentEntry; i++) {
        const post = await contract.getPost(i);
        posts.push(post);
      }

      setPosts(posts);
    }

    loadPosts();
  }, []);

  const createPost = async () => {
    try {
      const tx = await contract.createPost(newCid);
      await tx.wait();

      // Update the posts list
      const post = await contract.getPost(posts.length + 1);
      setPosts([...posts, post]);
      setNewCid('');
    } catch (error) {
      console.error(error);
    }
  };

  const respondToPost = async () => {
    try {
      const postId = selectedPost + 1; // Post IDs are 1-based
      const tx = await contract.respondToPost(postId, newCid);
      await tx.wait();

      // Update the responses list
      const response = await contract.getResponse(postId, responses.length + 1);
      setResponses([...responses, response]);
      setNewCid('');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostSelection = (postId) => {
    setSelectedPost(postId);
    // Load responses for the selected post
    async function loadResponses() {
      const postResponses = [];

      for (let i = 1; i <= posts[postId].responseCount; i++) {
        const response = await contract.getResponse(postId + 1, i); // Post IDs are 1-based
        postResponses.push(response);
      }

      setResponses(postResponses);
    }

    loadResponses();
  };

  

  return (
    <div className="p-1">

      <div className="mb">


      <h2 className="text-lg font-semibold mb-2">Questions</h2>
      <div className="mb-8">
        {posts.map((post, index) => (
          <div key={index} className="cursor-pointer">
            <p
              onClick={() => handlePostSelection(index)}
              className={`${
                selectedPost === index ? 'text-blue-500 underline' : ''
              }`}
            >
              {post.cid}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Responses</h2>
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border text-black border-gray-300 p-2 w-64"
            value={newCid}
            onChange={(e) => setNewCid(e.target.value)}
            placeholder="Your response"
          />
          <button
            onClick={respondToPost}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Respond to Post
          </button>
        </div>
        <div className="mt-4">
          {responses.map((response, index) => (
            <div key={index}>
              <p className="text-green-500">{response.cid}</p>
            </div>
          ))}
        </div>
      </div>
        
      <h2 className="text-lg font-semibold mb-2">Create Post</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border text-black border-gray-300 p-2 w-64"
            value={newCid}
            onChange={(e) => setNewCid(e.target.value)}
            placeholder="Enter your question"
          />
          <button
            onClick={createPost}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Post
          </button>
        </div>
        <div className="mt-4">
          {posts.map((post, index) => (
            <div key={index} className="cursor-pointer">
              <p onClick={() => handlePostSelection(index)} className="text-blue-500 underline">
                {post.cid}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default Posts;
