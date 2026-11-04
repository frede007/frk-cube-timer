<script>

  let { scramble } = $props();
</script>

<div class="scramble">
  {scramble}
</div>

<style>
  .scramble {
    font-size: clamp(1.25rem, 3vw, 2rem);
    line-height: 1.2;
    user-select: none;
    text-align: center;
  }
</style>