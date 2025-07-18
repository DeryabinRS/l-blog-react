<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserParam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class UserParamController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(UserParam $userParam)
    {
        return response()->json($userParam);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserParam $userParam)
    {
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'gender' => 'nullable|integer|between:0,2',
            'phone' => 'nullable|string|max:20',
        ]);

        $userParam->update($validated);

        return response()->json([
            'message' => 'User parameters updated successfully',
            'data' => $userParam->fresh()
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();
        $userParam = $user->params()->firstOrNew();

        // Delete old avatar if exists
        if ($userParam->avatar) {
            Storage::disk('public')->delete('avatars/'.$userParam->avatar);
        }

        // Обрабатываем изображение (новый синтаксис Intervention Image v3+)
        $image = Image::read($request->file('image'))
            ->cover(300, 300) // Аналог fit() в старых версиях
            ->toJpeg(80);     // Кодируем в JPEG с качеством 80%

        // Generate filename and path
        $filename = 'user_' . $user->id . '.jpg';
        $directory = 'avatars';
        $path = $directory . '/' . $filename;

        // Save the image using Storage
        Storage::disk('public')->put($path, $image);

        // Update user params
        $userParam->avatar = $filename;
        $userParam->save();

        return to_route('profile.edit');
    }
}
