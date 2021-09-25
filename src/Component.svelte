<svelte:options tag="page-preview" />

<script>
	import { fade } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';

	export let href;
	export let content;
	export let node;
	export let imgsrc;
	export let external = false;

	let visible = false;
	let top;
	let left;

	const showContent = content && content !== 'null';
	const showImg = imgsrc && imgsrc !== 'null';

	const height = showContent ? 172 : 60;
	const width = showContent && showImg ? 400 : 272;
	let renderedHeight = height;

	let element;

	const positionPreview = (actualHeight) => {
		if (element) {
			const linkPos = element.getBoundingClientRect();

			// keep the previews a bit away from the sides
			const addedMargin = 40;
			const fullWidth = width + addedMargin;
			const fullHeight = actualHeight + addedMargin;

			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			if (windowWidth - linkPos.x < fullWidth) {
				left = windowWidth - fullWidth;
			} else {
				left = linkPos.x;
			}

			if (windowHeight - (linkPos.y + linkPos.height) < fullHeight) {
				top = linkPos.y - actualHeight - linkPos.height + 5;
			} else {
				top = linkPos.y + linkPos.height;
			}
		}
	};

	$: {
		// reposition when height changes
		positionPreview(renderedHeight);
	}

	const toggleOn = () => {
		positionPreview(renderedHeight);
		visible = true;
	};
	const toggleOff = () => {
		visible = false;
	};
</script>

<span class="preview-wrapper">
	<span on:mouseover={toggleOn} on:focus={toggleOn} on:mouseout={toggleOff} on:blur={toggleOff}>
		<a class:external {href} bind:this={element} target={external ? 'blank' : ''}><slot /></a>
	</span>
	{#if visible}
		<a {href}>
			<div
				transition:fade={{ duration: 150, easing: cubicIn }}
				class="preview"
				class:external
				style="position:fixed; top:{top}px; left:{left}px; height:{height}px; width:{width}px;"
			>
				<style>
					.link-content p {
						margin: 0;
						margin-bottom: 10px;
					}

					.link-content a {
						color: black;
						pointer-events: none;
						text-decoration: none;
						font-size: 16px !important;
					}
				</style>
				<div class="link" bind:clientHeight={renderedHeight}>
					{#if showContent || showImg}
						<div class="link-content-wrapper">
							{#if showContent}
								<div class="link-content">{@html content}</div>
							{/if}
							{#if showImg}
								<img class="link-image" class:left={showContent} src={imgsrc} alt={node} />
							{/if}
						</div>
					{/if}
					{#if node}
						<div class="link-node">{node}</div>
					{/if}
					{#if external}
						<div class="link-url">{href}</div>
					{/if}
				</div>
			</div>
		</a>
	{/if}
</span>

<style>
	.preview-wrapper {
		--internal: #a31621;
		--external: #1d31e2;
	}
	.preview {
		z-index: 1000;
		--color: var(--internal);
	}

	.preview.external {
		--color: var(--external);
	}

	.link {
		max-width: 100%;
		background-color: white;
		color: black;
		text-decoration: none;
		padding: 10px;
		border: 2px solid var(--color);
		border-bottom: 4px solid var(--color);
		margin-top: 5px;
		border-radius: 10px;
		font-weight: normal;
		font-style: normal;
	}

	.link-content {
		font-size: 16px;
		line-height: 110%;
		display: inline-block;
		position: relative;
		height: 120px;
		overflow: hidden;
	}

	.link-node {
		color: var(--color);
		font-family: var(--sans);
		font-weight: bold;
	}

	.link-content-wrapper {
		display: flex;
		border-bottom: 1px solid var(--color);
		margin-bottom: 5px;
	}

	.link-image {
		height: 120px;
		object-fit: cover;
		object-position: center center;
		width: 100%;
		min-width: 150px;
	}

	.link-image.left {
		padding-left: 10px;
	}

	.link-url {
		font-size: 12px;
		font-family: var(--sans);
	}

	.link-content::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 275px;
		height: 50px;
		background-image: linear-gradient(transparent, white);
	}

	a {
		color: black;
		transition: color 0.3s;
		font-size: 18px;
		line-height: 125%;
	}

	a.external:hover {
		color: var(--external) !important;
	}

	a:hover {
		color: var(--internal) !important;
	}

	a:visited {
		color: black;
	}
</style>
