document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Highlight active nav item
    window.addEventListener('scroll', function() {
        let scrollPosition = window.scrollY;

        document.querySelectorAll('section').forEach(section => {
            if (scrollPosition >= section.offsetTop - 100 && scrollPosition < (section.offsetTop + section.offsetHeight - 100)) {
                let currentId = section.getAttribute('id');
                document.querySelectorAll('.nav a').forEach(navItem => {
                    navItem.classList.remove('active');
                    if (navItem.getAttribute('href') === `#${currentId}`) {
                        navItem.classList.add('active');
                    }
                });
            }
        });
    });

    // Fade in food items on scroll
    const foodItems = document.querySelectorAll('.food-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    foodItems.forEach(item => {
        observer.observe(item);
    });
});

let currentPage = 1;
const postsPerPage = 10;

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (response.ok) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    fetchPosts();
    fetchComments();
  } else {
    alert('Login failed');
  }
});

document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('create-title').value;
  const content = document.getElementById('create-content').value;
  const author = document.getElementById('create-author').value;
  const imageUrl = document.getElementById('create-imageUrl').value;

  const response = await fetch('/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, author, imageUrl })
  });

  if (response.ok) {
    alert('Post created successfully');
    fetchPosts();
  } else {
    alert('Failed to create post');
  }
});

document.getElementById('update-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('update-id').value;
  const title = document.getElementById('update-title').value;
  const content = document.getElementById('update-content').value;
  const author = document.getElementById('update-author').value;
  const imageUrl = document.getElementById('update-imageUrl').value;

  const response = await fetch(`/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, author, imageUrl })
  });

  if (response.ok) {
    alert('Post updated successfully');
    fetchPosts();
  } else {
    alert('Failed to update post');
  }
});

document.getElementById('delete-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('delete-id').value;

  const response = await fetch(`/admin/posts/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    alert('Post deleted successfully');
    fetchPosts();
  } else {
    alert('Failed to delete post');
  }
});

async function fetchPosts(page = 1) {
  const response = await fetch(`/posts?page=${page}&limit=${postsPerPage}`);
  const data = await response.json();
  const posts = data.posts;
  const totalPages = data.totalPages;
  const postsList = document.getElementById('posts-list');
  const paginationControls = document.getElementById('pagination-controls');
  postsList.innerHTML = '';
  paginationControls.innerHTML = '';

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post';
    postElement.innerHTML = `
      <img src="${post.imageUrl}" alt="Blogindlæg billede">
      <div class="blog-content">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="blog-meta">
          <span><i class="far fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
          <span><i class="far fa-user"></i> Af ${post.author}</span>
        </div>
      </div>
    `;
    postsList.appendChild(postElement);
  });

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === page ? 'active' : '';
    pageButton.addEventListener('click', () => fetchPosts(i));
    paginationControls.appendChild(pageButton);
  }
}

async function fetchPosts() {
  const response = await fetch('/posts');
  const posts = await response.json();
  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = '';

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post';
    postElement.innerHTML = `
      <img src="${post.imageUrl}" alt="Blogindlæg billede">
      <div class="blog-content">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="blog-meta">
          <span><i class="far fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
          <span><i class="far fa-user"></i> Af ${post.author}</span>
        </div>
      </div>
    `;
    postsList.appendChild(postElement);
  });
}

async function fetchComments() {
  const response = await fetch('/admin/comments');
  const comments = await response.json();
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <p>${comment.content}</p>
      <div class="comment-meta">
        <span><i class="far fa-user"></i> ${comment.author}</span>
        <span><i class="far fa-calendar"></i> ${new Date(comment.date).toLocaleDateString()}</span>
      </div>
      <button class="approve" onclick="approveComment('${comment._id}')">Approve</button>
      <button class="reject" onclick="rejectComment('${comment._id}')">Reject</button>
    `;
    commentsList.appendChild(commentElement);
  });
}

async function approveComment(id) {
  const response = await fetch(`/admin/comments/${id}/approve`, {
    method: 'POST'
  });

  if (response.ok) {
    alert('Comment approved');
    fetchComments();
  } else {
    alert('Failed to approve comment');
  }
}

async function rejectComment(id) {
  const response = await fetch(`/admin/comments/${id}/reject`, {
    method: 'POST'
  });

  if (response.ok) {
    alert('Comment rejected');
    fetchComments();
  } else {
    alert('Failed to reject comment');
  }
}